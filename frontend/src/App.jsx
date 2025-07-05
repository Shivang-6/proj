// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login";
import Marketplace from "./pages/Marketplace.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Sell from "./pages/Sell.jsx";
import Profile from "./pages/Profile.jsx";
import PurchaseHistory from "./pages/PurchaseHistory.jsx";
import Chats from "./pages/Chats.jsx";
import Signup from "./pages/Signup.jsx";
import MyProducts from "./pages/MyProducts.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Footer from "./components/Footer.jsx";
import "./App.css";
import Navbar from "./components/Navbar.jsx";
import { useState, useEffect } from "react";
import axios from "axios";
import { CartProvider } from "./contexts/CartContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

const App = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/auth/login/success`, { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);
  const handleLogout = async () => {
    await axios.get(`${import.meta.env.VITE_API_URL}/auth/logout`, { withCredentials: true });
    setUser(null);
    window.location.href = "/login";
  };
  return (
    <ThemeProvider>
      <CartProvider>
        <Router>
          <Navbar user={user} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Marketplace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/my-products" element={<MyProducts />} />
            <Route path="/landing" element={<Marketplace />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/history" element={<PurchaseHistory />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
          <Footer />
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
};

export default App;
