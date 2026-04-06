const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, required: true },
    amountPaise: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["captured", "failed"], default: "captured" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
