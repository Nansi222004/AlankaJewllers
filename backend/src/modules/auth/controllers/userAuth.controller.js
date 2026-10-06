const bcrypt = require("bcryptjs");
const User = require("../../../models/User");
const EmailOTP = require("../../../models/EmailOTP");
const { signToken } = require("../../../config/jwt");
const { enqueueEmail } = require("../../../services/emailService");
const emailTemplates = require("../../../services/emailTemplates");
const {
  createChallenge,
  digest,
  makeResetToken,
  normalizeEmail,
  resendChallenge,
  safeEqual,
  verifyChallenge,
} = require("../../../services/emailOtpService");
const { success, error } = require("../../../utils/apiResponse");

const challengePayload = (record) => ({
  challengeId: record.challengeId,
  email: record.email.replace(/^(.{2}).*(@.*)$/, "$1***$2"),
  expiresIn: 600,
  resendAfter: 60,
});

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  phone: user.phone,
  email: user.email,
  emailVerified: Boolean(user.emailVerified),
  role: user.role,
});

const issueSession = (res, user, message) => {
  const token = signToken({
    userId: user._id,
    role: user.role,
    phone: user.phone,
    email: user.email,
  });
  return success(res, { token, user: publicUser(user) }, message);
};

const ensureActiveUser = (res, user) => {
  if (user.isDeleted) {
    error(res, "This account no longer exists.", 401, "ACCOUNT_DELETED");
    return false;
  }
  if (user.isBlocked) {
    error(res, "Your account has been suspended. Please contact support.", 403, "ACCOUNT_BLOCKED");
    return false;
  }
  return true;
};

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email, role: "user" }).select("+password");
    if (!user?.password || !(await bcrypt.compare(req.body.password, user.password))) {
      return error(res, "Invalid email or password.", 401, "INVALID_CREDENTIALS");
    }
    if (!ensureActiveUser(res, user)) return;

    return issueSession(res, user, "Login successful");
  } catch (_err) {
    return error(res, "Unable to start login. Please try again.", 500);
  }
};

exports.register = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const phone = String(req.body.phone || "").replace(/\D/g, "").slice(-10);
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return error(
        res,
        existing.email === email
          ? "An account with this email already exists."
          : "This mobile number is already registered.",
        409,
        "ACCOUNT_EXISTS",
      );
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    await EmailOTP.deleteMany({ email, purpose: "user_registration" });
    const challenge = await createChallenge({
      email,
      purpose: "user_registration",
      metadata: { name: String(req.body.name || "").trim(), phone, passwordHash },
    });
    if (!challenge) {
      return error(res, "Unable to send verification email. Please try again.", 503, "EMAIL_SEND_FAILED");
    }
    return success(res, challengePayload(challenge), "Verification code sent.");
  } catch (_err) {
    return error(res, "Unable to create account. Please try again.", 500);
  }
};

exports.verifyEmailOtp = async (req, res) => {
  try {
    const challenge = await EmailOTP.findOne({ challengeId: req.body.challengeId });
    if (!challenge || challenge.purpose !== "user_registration") {
      return error(res, "This verification code has expired. Please request a new code.", 400, "OTP_EXPIRED");
    }
    const result = await verifyChallenge({
      challengeId: challenge.challengeId,
      otp: req.body.otp,
      purpose: challenge.purpose,
    });
    if (!result.ok) {
      const messages = {
        OTP_EXPIRED: ["This verification code has expired. Please request a new code.", 400],
        OTP_INVALID: ["Invalid verification code.", 400],
        OTP_MAX_ATTEMPTS: ["Too many attempts. Please request a new code.", 429],
      };
      const [message, status] = messages[result.code] || messages.OTP_INVALID;
      return error(res, message, status, result.code);
    }

    const { name, phone, passwordHash } = result.record.metadata || {};
    const conflict = await User.findOne({ $or: [{ email: result.record.email }, { phone }] });
    if (conflict) {
      await EmailOTP.deleteOne({ _id: result.record._id });
      return error(res, "An account with these details already exists.", 409, "ACCOUNT_EXISTS");
    }
    const user = await User.create({
      name,
      phone,
      email: result.record.email,
      password: passwordHash,
      emailVerified: true,
      role: "user",
    });
    enqueueEmail({
      to: user.email,
      subject: "Welcome to Alankarr Jewellers!",
      html: emailTemplates.welcomeEmail({ userName: user.name }),
      type: "welcome",
    });

    await EmailOTP.deleteOne({ _id: result.record._id });
    return issueSession(res, user, "Account created successfully");
  } catch (_err) {
    return error(res, "Unable to verify the code. Please try again.", 500);
  }
};

exports.resendEmailOtp = async (req, res) => {
  try {
    const result = await resendChallenge({ challengeId: req.body.challengeId });
    if (!result.ok) {
      if (result.code === "OTP_RESEND_COOLDOWN") {
        return error(res, `Please wait ${result.retryAfter} seconds before requesting another code.`, 429, result.code);
      }
      if (result.code === "EMAIL_SEND_FAILED") {
        return error(res, "Unable to send verification email. Please try again.", 503, result.code);
      }
      return error(res, "This verification code has expired. Please start again.", 400, "OTP_EXPIRED");
    }
    return success(res, challengePayload(result.record), "A new verification code has been sent.");
  } catch (_err) {
    return error(res, "Unable to resend the verification email. Please try again.", 500);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email, role: "user" }).select("+password");
    // Existing SMS-era customers with a valid email can securely establish
    // their first password through this verified-email recovery flow.
    if (!user || user.isDeleted || user.isBlocked) {
      return success(res, { challengeId: makeResetToken(), expiresIn: 600, resendAfter: 60 }, "If an account exists, a verification code has been sent.");
    }
    await EmailOTP.deleteMany({ userId: user._id, purpose: "user_password_reset" });
    const challenge = await createChallenge({ email, purpose: "user_password_reset", userId: user._id });
    if (!challenge) {
      return error(res, "Unable to send verification email. Please try again.", 503, "EMAIL_SEND_FAILED");
    }
    return success(res, challengePayload(challenge), "If an account exists, a verification code has been sent.");
  } catch (_err) {
    return error(res, "Unable to process this request. Please try again.", 500);
  }
};

exports.verifyPasswordResetOtp = async (req, res) => {
  try {
    const result = await verifyChallenge({
      challengeId: req.body.challengeId,
      otp: req.body.otp,
      purpose: "user_password_reset",
    });
    if (!result.ok) {
      const status = result.code === "OTP_MAX_ATTEMPTS" ? 429 : 400;
      const message = result.code === "OTP_EXPIRED"
        ? "This verification code has expired. Please request a new code."
        : result.code === "OTP_MAX_ATTEMPTS"
          ? "Too many attempts. Please request a new code."
          : "Invalid verification code.";
      return error(res, message, status, result.code);
    }
    const resetToken = makeResetToken();
    result.record.verifiedAt = new Date();
    result.record.resetTokenHash = digest(resetToken);
    result.record.resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    result.record.otpHash = null;
    await result.record.save();
    return success(res, { resetToken }, "Email verified. You may now set a new password.");
  } catch (_err) {
    return error(res, "Unable to verify the code. Please try again.", 500);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const record = await EmailOTP.findOne({ challengeId: req.body.challengeId, purpose: "user_password_reset" });
    if (
      !record?.verifiedAt ||
      !record.resetTokenExpiresAt ||
      record.resetTokenExpiresAt <= new Date() ||
      !safeEqual(digest(req.body.resetToken), record.resetTokenHash)
    ) {
      return error(res, "This password reset session has expired. Please start again.", 400, "RESET_EXPIRED");
    }
    const user = await User.findById(record.userId).select("+password");
    if (!user) return error(res, "This account no longer exists.", 401, "ACCOUNT_DELETED");
    if (!ensureActiveUser(res, user)) return;
    user.password = await bcrypt.hash(req.body.newPassword, 12);
    user.emailVerified = true;
    await user.save();
    await EmailOTP.deleteOne({ _id: record._id });
    return success(res, {}, "Password updated successfully. Please log in.");
  } catch (_err) {
    return error(res, "Unable to reset the password. Please try again.", 500);
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return error(res, "User not found.", 404, "USER_NOT_FOUND");
    if (!ensureActiveUser(res, user)) return;
    return success(res, { user: publicUser(user) }, "User profile retrieved");
  } catch (_err) {
    return error(res, "Unable to load your account.", 500);
  }
};

exports.logout = async (_req, res) => success(res, {}, "Logged out successfully");
