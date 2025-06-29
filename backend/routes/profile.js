import express from "express";
import User from "../models/user.js";
import Product from "../models/product.js";

const router = express.Router();

// Get user profile
router.get("/me", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
});

// Get user profile by ID (public)
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-googleId -email');
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
});

// Update user profile
router.put("/me", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { displayName, phoneNumber, campus, bio } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        displayName,
        phoneNumber,
        campus,
        bio
      },
      { new: true }
    );

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
});

// Get user's products
router.get("/me/products", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // For own profile, show all products (including sold-out ones)
    const products = await Product.find({ seller: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching user products:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
});

// Get user's products by ID (public)
router.get("/:userId/products", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // For public profiles, only show available products
    const products = await Product.find({ 
      seller: userId,
      isAvailable: true,
      quantity: { $gt: 0 }
    })
      .populate('seller', 'name displayName')
      .sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching user products:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
});

export default router; 