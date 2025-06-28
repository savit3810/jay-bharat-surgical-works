// routes/account.js
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const db = admin.firestore();
const usersRef = db.collection("users");

// GET user info by UID
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const doc = await usersRef.doc(uid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE user name by UID
router.put("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });

    await usersRef.doc(uid).update({ name });
    res.json({ message: "User name updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE account (optional)
router.delete("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    await usersRef.doc(uid).delete();
    res.json({ message: "User deleted from Firestore. Revoke access from Firebase Auth separately." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
