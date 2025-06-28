// routes/product.js
const express = require("express");
const router = express.Router();
const db = require("../firebase");

// Add new product
router.post("/add", async (req, res) => {
  try {
    const product = req.body;
    const docRef = await db.collection("products").add(product);
    res.status(201).json({ id: docRef.id, message: "Product added successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("products").get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
