const mongoose = require("mongoose");

// Email OTPs used for flows like seller password reset.
// Short-lived via TTL index on createdAt.
const emailOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, default: null }, // legacy Admin reset records only
  otpHash: { type: String, default: null },
  challengeId: { type: String, default: null, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  purpose: { type: String, default: "seller_password_reset", index: true },
  attempts: { type: Number, default: 0 },
  sentAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
  verifiedAt: { type: Date, default: null },
  resetTokenHash: { type: String, default: null },
  resetTokenExpiresAt: { type: Date, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // TTL: 10 minutes
});

module.exports = mongoose.model("EmailOTP", emailOtpSchema);

