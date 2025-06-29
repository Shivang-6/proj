import express from "express";
import Transaction from "../models/transaction.js";
import Product from "../models/product.js";

const router = express.Router();

// Get user's purchase history (as buyer)
router.get("/purchases", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const purchases = await Transaction.find({ buyer: req.user._id })
      .populate('product', 'name description imageUrl imageUrls')
      .populate('seller', 'name displayName')
      .sort({ transactionDate: -1 });

    res.json({ success: true, purchases });
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    res.status(500).json({ success: false, message: "Failed to fetch purchase history" });
  }
});

// Get user's sales history (as seller)
router.get("/sales", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const sales = await Transaction.find({ seller: req.user._id })
      .populate('product', 'name description imageUrl imageUrls')
      .populate('buyer', 'name displayName')
      .sort({ transactionDate: -1 });

    res.json({ success: true, sales });
  } catch (error) {
    console.error("Error fetching sales history:", error);
    res.status(500).json({ success: false, message: "Failed to fetch sales history" });
  }
});

// Get all transactions for a user (both purchases and sales)
router.get("/all", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const transactions = await Transaction.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }]
    })
      .populate('product', 'name description imageUrl imageUrls')
      .populate('buyer', 'name displayName')
      .populate('seller', 'name displayName')
      .sort({ transactionDate: -1 });

    res.json({ success: true, transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
});

// Create a simple transaction (basic purchase record)
router.post("/create", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { productId, sellerId, price, notes } = req.body;

    // Validate required fields
    if (!productId || !sellerId || !price) {
      return res.status(400).json({ 
        success: false, 
        message: "Product ID, seller ID, and price are required" 
      });
    }

    // Check if user is trying to buy their own product
    if (req.user._id.toString() === sellerId) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot buy your own product" 
      });
    }

    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Create transaction
    const transaction = new Transaction({
      product: productId,
      buyer: req.user._id,
      seller: sellerId,
      price: parseFloat(price),
      paymentMethod: 'cash', // Default to cash
      notes: notes || `Purchase of ${product.name}`
    });

    await transaction.save();
    await transaction.populate('product', 'name description imageUrl imageUrls');
    await transaction.populate('seller', 'name displayName');

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ success: false, message: "Failed to create transaction" });
  }
});

// Update transaction status
router.put("/:transactionId/status", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { transactionId } = req.params;
    const { status } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Check if user is the seller or buyer
    if (transaction.seller.toString() !== req.user._id.toString() && 
        transaction.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    transaction.status = status;
    await transaction.save();

    res.json({ success: true, transaction });
  } catch (error) {
    console.error("Error updating transaction status:", error);
    res.status(500).json({ success: false, message: "Failed to update transaction" });
  }
});

// Get transaction by ID
router.get("/:transactionId", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
      .populate('product', 'name description imageUrl imageUrls')
      .populate('buyer', 'name displayName')
      .populate('seller', 'name displayName');

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Check if user is authorized to view this transaction
    if (transaction.seller.toString() !== req.user._id.toString() && 
        transaction.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, transaction });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transaction" });
  }
});

// Debug endpoint to check transaction data
router.get("/debug/user-transactions", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const transactions = await Transaction.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }]
    }).lean();

    const populatedTransactions = await Transaction.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }]
    })
      .populate('product', 'name description imageUrl imageUrls')
      .populate('buyer', 'name displayName')
      .populate('seller', 'name displayName')
      .lean();

    res.json({ 
      success: true, 
      user: req.user._id,
      transactionCount: transactions.length,
      rawTransactions: transactions,
      populatedTransactions: populatedTransactions
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    res.status(500).json({ success: false, message: "Debug endpoint error" });
  }
});

export default router; 