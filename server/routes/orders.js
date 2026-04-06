const express = require("express");
const Order = require("../models/Order");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;
