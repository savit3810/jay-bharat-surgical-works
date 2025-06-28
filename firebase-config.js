// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD3t7Zx2kMXYoUMFJXzhhxWTJgHqNF83cY",
  authDomain: "jay-bharat-surgical-works.firebaseapp.com",
  projectId: "jay-bharat-surgical-works",
  storageBucket: "jay-bharat-surgical-works.appspot.com",
  messagingSenderId: "792288542566",
  appId: "1:792288542566:web:94d42a6ea86529893c12a7",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
