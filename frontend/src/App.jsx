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
import "./App.css"; 


const App = () => {
  return (
    <Router>
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
      </Routes>
    </Router>
  );
};

export default App;
