// server.js

import express from 'express';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import cors from 'cors';

// Load environment variables from .env
dotenv.config();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// ========== ROUTES ==========

// Health check
app.get('/', (req, res) => {
  res.send('Jay Bharat Surgical Works Backend is running ✅');
});

// Example route to get all products
app.get('/api/products', async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// Example route to add an order
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    const docRef = await db.collection('orders').add(orderData);
    res.status(201).json({ id: docRef.id, message: 'Order placed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

// More routes can be added here...

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
