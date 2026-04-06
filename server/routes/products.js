const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ legacyId: 1 }).lean();
    const formatted = products.map((p) => ({
      id: p.legacyId != null ? p.legacyId : p._id.toString(),
      _id: p._id.toString(),
      name: p.name,
      price: p.price,
      image: p.image,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;
