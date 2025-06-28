// routes/general.js
const express = require("express");
const router = express.Router();

// Test route
router.get("/", (req, res) => {
  res.send("Welcome to Jay Bharat Surgical Works API!");
});

// Store info (optional)
router.get("/store-info", (req, res) => {
  res.json({
    name: "Jay Bharat Surgical Works",
    description: "Leading surgical tools and equipment supplier",
    supportEmail: "support@jaybharatsurgical.com",
    location: "Mumbai, India"
  });
});

module.exports = router;
