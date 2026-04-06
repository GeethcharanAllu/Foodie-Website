const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    legacyId: { type: Number, unique: true, sparse: true },
    name: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
