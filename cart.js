// routes/cart.js
const express = require("express");
const router = express.Router();
const db = require("../firebase");

// Add item to cart
router.post("/add", async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ error: "userId and productId are required" });
  }

  try {
    const docRef = await db.collection("cart").add({
      userId,
      productId,
      timestamp: Date.now()
    });
    res.status(201).json({ id: docRef.id, message: "Item added to cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get cart items for a user
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const snapshot = await db.collection("cart").where("userId", "==", userId).get();
    if (snapshot.empty) return res.json([]);

    const cartItems = [];
    for (const docItem of snapshot.docs) {
      const cartData = docItem.data();
      const productRef = await db.collection("products").doc(cartData.productId).get();
      const product = productRef.exists ? productRef.data() : { name: "Unknown", image: "", stock: 0 };

      cartItems.push({
        id: docItem.id,
        productId: cartData.productId,
        ...product
      });
    }

    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item from cart
router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await db.collection("cart").doc(id).delete();
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
