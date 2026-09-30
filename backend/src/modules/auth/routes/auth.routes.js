const router = require("express").Router();
const {
  otpLimiter,
  verifyOtpLimiter,
} = require("../../../middlewares/rateLimiter");
const userAuth   = require("../controllers/userAuth.controller");
const adminAuth  = require("../controllers/adminAuth.controller");
const validate = require("../../../middlewares/validate");
const {
  userLoginSchema,
  userRegisterSchema,
  emailOtpSchema,
  resendEmailOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  adminLoginSchema,
  adminSendResetOtpSchema,
  adminResetPasswordSchema,
  adminSendResetMobileOtpSchema,
  adminResetPasswordMobileSchema,
} = require("../validators/auth.validator");

// Customer auth: password first, email OTP second factor, JWT only after verification.
router.post("/login", otpLimiter, validate(userLoginSchema), userAuth.login);
router.post("/register", otpLimiter, validate(userRegisterSchema), userAuth.register);
router.post("/verify-email-otp", verifyOtpLimiter, validate(emailOtpSchema), userAuth.verifyEmailOtp);
router.post("/resend-email-otp", otpLimiter, validate(resendEmailOtpSchema), userAuth.resendEmailOtp);
router.post("/forgot-password", otpLimiter, validate(forgotPasswordSchema), userAuth.forgotPassword);
router.post("/verify-password-reset-otp", verifyOtpLimiter, validate(emailOtpSchema), userAuth.verifyPasswordResetOtp);
router.post("/reset-password", otpLimiter, validate(resetPasswordSchema), userAuth.resetPassword);
router.get("/me",           require("../../../middlewares/authenticate"), userAuth.getMe);
router.post("/logout",      userAuth.logout);

// Admin auth
router.post("/admin/login",  validate(adminLoginSchema), adminAuth.login);
router.post("/admin/logout", adminAuth.logout);
router.post("/admin/send-reset-otp", validate(adminSendResetOtpSchema), adminAuth.sendResetOtp);
router.post("/admin/reset-password", validate(adminResetPasswordSchema), adminAuth.resetPassword);
router.post("/admin/send-reset-mobile-otp", validate(adminSendResetMobileOtpSchema), adminAuth.sendResetMobileOtp);
router.post("/admin/reset-password-mobile", validate(adminResetPasswordMobileSchema), adminAuth.resetPasswordViaMobile);

module.exports = router;

