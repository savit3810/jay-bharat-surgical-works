// routes/order.js
const express = require("express");
const router = express.Router();
const db = require("../firebase");

// Place a new order
router.post("/place", async (req, res) => {
  const { userId, items } = req.body;

  if (!userId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "userId and items are required" });
  }

  try {
    const newOrder = {
      userId,
      items,
      status: "Processing",
      timestamp: Date.now()
    };

    const docRef = await db.collection("orders").add(newOrder);
    res.status(201).json({ id: docRef.id, message: "Order placed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders for a user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const snapshot = await db.collection("orders").where("userId", "==", userId).get();
    if (snapshot.empty) return res.json([]);

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel an order
router.patch("/cancel/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.collection("orders").doc(id).update({ status: "Cancelled" });
    res.json({ message: "Order cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
