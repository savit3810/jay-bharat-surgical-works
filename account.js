// routes/account.js
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const axios = require("axios");

const db = admin.firestore();
const usersRef = db.collection("users");

// SIGNUP - Create Firebase Auth user + Firestore entry
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Save user info to Firestore
    await usersRef.doc(userRecord.uid).set({
      name,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ message: "Signup successful", uid: userRecord.uid });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

// LOGIN - Authenticate using Firebase Auth REST API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const apiKey = process.env.FIREBASE_API_KEY;
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    const response = await axios.post(url, {
      email,
      password,
      returnSecureToken: true
    });

    const uid = response.data.localId;

    // Fetch additional user info from Firestore
    const userDoc = await usersRef.doc(uid).get();

    res.json({
      uid,
      email: response.data.email,
      name: userDoc.exists ? userDoc.data().name : ""
    });
  } catch (err) {
    res.status(401).json({ message: "Login failed", error: err.message });
  }
});

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

// DELETE user account from Firestore
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
