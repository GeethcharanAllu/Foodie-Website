const Product = require("../models/Product");

function parsePrice(str) {
  return parseFloat(String(str).replace(/[$₹]/g, "").trim()) || 0;
}

/**
 * Builds line items and total from cart payload [{ productId, quantity }].
 * @returns {{ lineDocs: Array, totalAmount: number }}
 */
async function buildLineItemsFromCartItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart items are required");
  }

  const lineDocs = [];
  let totalAmount = 0;

  for (const line of items) {
    const { productId, quantity } = line;
    if (!productId || !quantity || quantity < 1) {
      throw new Error("Each item needs productId and quantity");
    }
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Invalid product in cart");
    }
    const unitPrice = parsePrice(product.price);
    const lineTotal = Math.round(unitPrice * quantity * 100) / 100;
    totalAmount += lineTotal;
    lineDocs.push({
      productId: product._id,
      name: product.name,
      quantity,
      unitPrice,
      lineTotal,
    });
  }

  totalAmount = Math.round(totalAmount * 100) / 100;
  return { lineDocs, totalAmount };
}

module.exports = { buildLineItemsFromCartItems, parsePrice };
