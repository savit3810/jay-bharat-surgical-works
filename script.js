// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, addDoc, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD3t7Zx2kMXYoUMFJXzhhxWTJgHqNF83cY",
  authDomain: "jay-bharat-surgical-works.firebaseapp.com",
  projectId: "jay-bharat-surgical-works",
  storageBucket: "jay-bharat-surgical-works.appspot.com",
  messagingSenderId: "792288542566",
  appId: "1:792288542566:web:94d42a6ea86529893c12a7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Signup Logic
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (password !== confirm) return alert("Passwords do not match");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      await setDoc(doc(db, "users", uid), { name, email });
      alert("Signup successful!");
      window.location.href = "login.html";
    } catch (err) {
      alert("Signup error: " + err.message);
    }
  });
}

// Login Logic
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const docSnap = await getDoc(doc(db, "users", uid));
      const userData = docSnap.data();
      localStorage.setItem("user", JSON.stringify({ uid, ...userData }));
      alert("Login successful!");
      window.location.href = "account.html";
    } catch (err) {
      alert("Login error: " + err.message);
    }
  });
}

// Account Page - Show User Info
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
if (nameInput && emailInput) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;
      const docSnap = await getDoc(doc(db, "users", uid));
      if (docSnap.exists()) {
        nameInput.value = docSnap.data().name || "";
        emailInput.value = user.email;
      }
    } else {
      alert("Not logged in.");
      window.location.href = "login.html";
    }
  });
}

// Account Page - Update Password
window.updatePassword = async function () {
  const pass1 = document.getElementById("password").value;
  const pass2 = document.getElementById("confirm-password").value;
  if (pass1 !== pass2) return alert("Passwords do not match.");

  const user = auth.currentUser;
  if (user) {
    try {
      await updatePassword(user, pass1);
      alert("Password updated successfully.");
    } catch (err) {
      alert("Error: " + err.message);
    }
  }
};

// Cart Page - Show Items
const cartContainer = document.getElementById("cartContainer");
if (cartContainer) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return (window.location.href = "login.html");

    const q = query(collection(db, "cart"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      document.getElementById("emptyMessage").style.display = "block";
    } else {
      snapshot.forEach(async (docItem) => {
        const item = docItem.data();
        const productSnap = await getDoc(doc(db, "products", item.productId));
        const product = productSnap.exists() ? productSnap.data() : { name: "Unknown", image: "", stock: 0 };

        const div = document.createElement("div");
        div.className = "tool-card";
        div.innerHTML = `
          <img src="${product.image}" alt="${product.name}">
          <h3>${product.name}</h3>
          <p class="stock-text">${product.stock > 0 ? "In Stock" : '<span class="out-of-stock">Out of Stock</span>'}</p>
          <button onclick="removeFromCart('${docItem.id}')">Remove</button>
        `;
        cartContainer.appendChild(div);
      });
    }
  });
}

// Remove from Cart
window.removeFromCart = async function (id) {
  await deleteDoc(doc(db, "cart", id));
  alert("Item removed from cart.");
  window.location.reload();
};

// My Orders Page
const ordersList = document.getElementById("ordersList");
if (ordersList) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return (window.location.href = "login.html");

    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      ordersList.innerHTML = "<p>No orders found.</p>";
    } else {
      snapshot.forEach((docItem) => {
        const order = docItem.data();
        const div = document.createElement("div");
        div.className = "order-card";
        div.innerHTML = `
          <h4>Order ID: ${docItem.id}</h4>
          <p><strong>Status:</strong> ${order.status}</p>
          <div class="order-actions">
            <button class="view-btn" onclick="viewOrder('${docItem.id}', '${order.status}')">View More</button>
            <button class="cancel-btn" onclick="cancelOrder('${docItem.id}')">Cancel Order</button>
            <button class="track-btn" onclick="trackOrder('${docItem.id}')">Track Shipment</button>
          </div>
        `;
        ordersList.appendChild(div);
      });
    }
  });
}

// Modal Handlers
window.viewOrder = function (id, status) {
  document.getElementById("orderModal").style.display = "block";
  document.getElementById("modalTitle").textContent = "Order Details - " + id;
  document.getElementById("modalContent").innerHTML = `<p>Status: ${status}</p>`;
};

window.closeModal = function () {
  document.getElementById("orderModal").style.display = "none";
};

window.cancelOrder = async function (id) {
  await setDoc(doc(db, "orders", id), { status: "Cancelled" }, { merge: true });
  alert("Order cancelled.");
  window.location.reload();
};

window.trackOrder = function (id) {
  alert("Tracking shipment for Order: " + id);
};
