"use strict";

const crypto = require("crypto");
const EmailOTP = require("../models/EmailOTP");
const { sendEmail } = require("./emailService");
const emailTemplates = require("./emailTemplates");

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const makeOtp = () => String(crypto.randomInt(100000, 1000000));
const makeChallengeId = () => crypto.randomBytes(32).toString("hex");
const makeResetToken = () => crypto.randomBytes(32).toString("hex");
const digest = (value) =>
  crypto.createHmac("sha256", process.env.JWT_SECRET).update(String(value)).digest("hex");

const safeEqual = (left, right) => {
  const a = Buffer.from(String(left || ""), "hex");
  const b = Buffer.from(String(right || ""), "hex");
  return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
};

const sendChallengeEmail = async ({ email, otp, purpose }) =>
  sendEmail({
    to: email,
    subject: "Your Alankarr Jewellers Verification Code",
    html: emailTemplates.emailVerificationCode({
      code: otp,
      purpose: purpose === "user_password_reset" ? "password_reset" : "registration",
    }),
    type: purpose,
  });

const createChallenge = async ({ email, purpose, userId = null, metadata = null }) => {
  const normalizedEmail = normalizeEmail(email);
  const otp = makeOtp();
  const now = new Date();
  const record = await EmailOTP.create({
    email: normalizedEmail,
    otpHash: digest(otp),
    challengeId: makeChallengeId(),
    userId,
    purpose,
    attempts: 0,
    sentAt: now,
    expiresAt: new Date(now.getTime() + OTP_TTL_MS),
    metadata,
  });

  const sent = await sendChallengeEmail({ email: normalizedEmail, otp, purpose });
  if (!sent) {
    await EmailOTP.deleteOne({ _id: record._id });
    return null;
  }
  return record;
};

const verifyChallenge = async ({ challengeId, otp, purpose }) => {
  const record = await EmailOTP.findOne({ challengeId, purpose });
  if (!record || !record.expiresAt || record.expiresAt <= new Date()) {
    if (record) await EmailOTP.deleteOne({ _id: record._id });
    return { ok: false, code: "OTP_EXPIRED" };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    await EmailOTP.deleteOne({ _id: record._id });
    return { ok: false, code: "OTP_MAX_ATTEMPTS" };
  }
  if (!safeEqual(digest(otp), record.otpHash)) {
    record.attempts += 1;
    await record.save();
    if (record.attempts >= MAX_ATTEMPTS) {
      await EmailOTP.deleteOne({ _id: record._id });
      return { ok: false, code: "OTP_MAX_ATTEMPTS" };
    }
    return { ok: false, code: "OTP_INVALID" };
  }
  return { ok: true, record };
};

const resendChallenge = async ({ challengeId }) => {
  const record = await EmailOTP.findOne({ challengeId });
  if (!record || !record.expiresAt || record.expiresAt <= new Date()) {
    if (record) await EmailOTP.deleteOne({ _id: record._id });
    return { ok: false, code: "OTP_EXPIRED" };
  }
  const elapsed = Date.now() - new Date(record.sentAt).getTime();
  if (elapsed < RESEND_COOLDOWN_MS) {
    return {
      ok: false,
      code: "OTP_RESEND_COOLDOWN",
      retryAfter: Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000),
    };
  }
  const otp = makeOtp();
  const sent = await sendChallengeEmail({
    email: record.email,
    otp,
    purpose: record.purpose,
  });
  if (!sent) return { ok: false, code: "EMAIL_SEND_FAILED" };

  record.otpHash = digest(otp);
  record.attempts = 0;
  record.sentAt = new Date();
  record.expiresAt = new Date(Date.now() + OTP_TTL_MS);
  record.createdAt = new Date();
  await record.save();
  return { ok: true, record };
};

module.exports = {
  MAX_ATTEMPTS,
  OTP_TTL_MS,
  RESEND_COOLDOWN_MS,
  createChallenge,
  digest,
  makeResetToken,
  normalizeEmail,
  resendChallenge,
  safeEqual,
  verifyChallenge,
};
