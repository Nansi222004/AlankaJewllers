const Joi = require("joi");

const customerPassword = Joi.string().min(8).max(72).required();

exports.userLoginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: customerPassword,
});

exports.userRegisterSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().lowercase().email().required(),
  phone: Joi.string().length(10).pattern(/^[6-9][0-9]{9}$/).required(),
  password: customerPassword,
});

exports.emailOtpSchema = Joi.object({
  challengeId: Joi.string().hex().length(64).required(),
  otp: Joi.string().pattern(/^[0-9]{6}$/).required(),
});

exports.resendEmailOtpSchema = Joi.object({
  challengeId: Joi.string().hex().length(64).required(),
});

exports.forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

exports.resetPasswordSchema = Joi.object({
  challengeId: Joi.string().hex().length(64).required(),
  resetToken: Joi.string().hex().length(64).required(),
  newPassword: customerPassword,
});

exports.adminLoginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

exports.adminSendResetOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

exports.adminResetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

exports.adminSendResetMobileOtpSchema = Joi.object({
  mobileNumber: Joi.string().required(),
});

exports.adminResetPasswordMobileSchema = Joi.object({
  mobileNumber: Joi.string().required(),
  otp: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

