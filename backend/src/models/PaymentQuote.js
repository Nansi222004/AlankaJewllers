const mongoose = require("mongoose");

const paymentQuoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderData: { type: mongoose.Schema.Types.Mixed, required: true },
    amountPaise: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR", enum: ["INR"] },
    razorpayOrderId: { type: String, unique: true, sparse: true },
    status: {
      type: String,
      enum: ["pending", "processing", "consumed", "expired"],
      default: "pending",
      index: true,
    },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    consumedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

paymentQuoteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PaymentQuote", paymentQuoteSchema);
