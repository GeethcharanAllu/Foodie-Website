require("dotenv").config();
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Product = require("./models/Product");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/foodie";

async function seed() {
  const jsonPath = path.join(__dirname, "..", "products.json");
  const raw = fs.readFileSync(jsonPath, "utf8");
  const items = JSON.parse(raw);

  await mongoose.connect(MONGODB_URI);
  await Product.deleteMany({});
  for (const p of items) {
    await Product.create({
      legacyId: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
    });
  }
  console.log(`Seeded ${items.length} products.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
