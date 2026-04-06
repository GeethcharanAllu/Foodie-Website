const express = require("express");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const { authMiddleware } = require("../middleware/auth");
const { buildLineItemsFromCartItems } = require("../utils/orderLines");

const router = express.Router();

/** Create mock order for demo Razorpay checkout. */
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    let lineDocs;
    let totalAmount;
    try {
      const built = await buildLineItemsFromCartItems(items);
      lineDocs = built.lineDocs;
      totalAmount = built.totalAmount;
    } catch (e) {
      return res.status(400).json({ message: e.message || "Invalid cart" });
    }

    // Prices are already in INR, no conversion needed
    const amountPaise = Math.max(100, Math.round(totalAmount * 100));

    // Create mock order (no real Razorpay API call)
    const mockOrderId = `mock_${Date.now().toString(36)}_${req.userId.toString().slice(-6)}`;

    const order = await Order.create({
      user: req.userId,
      items: lineDocs,
      totalAmount: totalAmount,
      status: "pending_payment",
      razorpayOrderId: mockOrderId,
    });

    res.json({
      razorpayOrderId: mockOrderId,
      amount: amountPaise,
      currency: "INR",
      orderId: order._id,
      totalAmount: totalAmount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Could not create order" });
  }
});

/** Verify mock payment and save to database. */
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const { orderId, amount, currency } = req.body;
    if (!orderId || !amount) {
      return res.status(400).json({ message: "Missing payment fields" });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.userId,
      status: "pending_payment",
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found or already paid" });
    }

    // Generate mock payment ID
    const mockPaymentId = `mock_pay_${Date.now().toString(36)}_${req.userId.toString().slice(-6)}`;

    // Create payment record (mock, no real Razorpay)
    const payment = await Payment.create({
      user: req.userId,
      order: order._id,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: mockPaymentId,
      amountPaise: amount,
      currency: currency || "INR",
      status: "captured",
    });

    order.status = "confirmed";
    order.payment = payment._id;
    await order.save();

    res.json({
      message: "Order placed successfully",
      orderId: order._id,
      paymentId: payment._id,
      totalAmount: order.totalAmount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Verification failed" });
  }
});

module.exports = router;
