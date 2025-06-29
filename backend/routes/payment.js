import express from "express";
import razorpay from "../config/razorpay.js";
import Transaction from "../models/transaction.js";
import Product from "../models/product.js";
import Notification from "../models/notification.js";
import crypto from "crypto";

const router = express.Router();

// Create Razorpay order
router.post("/create-order", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { productId, sellerId, price } = req.body;

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

    // Check if product is available and has quantity
    if (!product.isAvailable || product.quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Product is out of stock" 
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(price * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        productId: productId,
        buyerId: req.user._id.toString(),
        sellerId: sellerId,
        productName: product.name
      }
    };

    const order = await razorpay.orders.create(options);

    // Create transaction record
    const transaction = new Transaction({
      product: productId,
      buyer: req.user._id,
      seller: sellerId,
      price: parseFloat(price),
      paymentMethod: 'razorpay',
      status: 'payment_initiated',
      razorpayOrderId: order.id,
      notes: `Payment initiated for ${product.name}`
    });

    await transaction.save();

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      transactionId: transaction._id
    });

  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
});

// Verify payment and update transaction
router.post("/verify-payment", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature, 
      transactionId 
    } = req.body;

    // Verify payment signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY || 'your_razorpay_secret_key_here')
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpaySignature;

    if (!isAuthentic) {
      return res.status(400).json({ 
        success: false, 
        message: "Payment verification failed" 
      });
    }

    // Update transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Verify transaction belongs to user
    if (transaction.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Get product and update quantity
    const product = await Product.findById(transaction.product);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check if product is still available
    if (!product.isAvailable || product.quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Product is out of stock" 
      });
    }

    // Update product quantity
    product.quantity = Math.max(0, product.quantity - 1);
    console.log(`Updated product ${product.name} quantity to: ${product.quantity}`);
    
    // Check if product is now sold out
    if (product.quantity === 0) {
      product.isAvailable = false;
      product.soldOutNotified = true;
      console.log(`Product ${product.name} is now sold out and marked as unavailable`);
      
      // Create notification for seller
      const notification = new Notification({
        user: product.seller,
        type: 'product_sold_out',
        title: 'Product Sold Out!',
        message: `Your product "${product.name}" has been sold out. You can re-list it anytime.`,
        product: product._id
      });
      await notification.save();
      console.log(`Created sold-out notification for seller ${product.seller}`);
    }

    await product.save();
    console.log(`Product ${product.name} saved with quantity: ${product.quantity}, isAvailable: ${product.isAvailable}`);

    // Update transaction with payment details
    transaction.razorpayPaymentId = razorpayPaymentId;
    transaction.razorpaySignature = razorpaySignature;
    transaction.paymentStatus = 'captured';
    transaction.status = 'payment_completed';
    transaction.notes = `Payment completed successfully for ${product.name}`;

    await transaction.save();

    // Create notification for seller about the sale
    const saleNotification = new Notification({
      user: product.seller,
      type: 'product_sold',
      title: 'Product Sold!',
      message: `Your product "${product.name}" has been sold for ₹${transaction.price}.`,
      product: product._id,
      transaction: transaction._id
    });
    await saleNotification.save();

    // Populate transaction details for response
    await transaction.populate('product', 'name description imageUrl');
    await transaction.populate('seller', 'name displayName');

    res.json({
      success: true,
      message: "Payment verified successfully",
      transaction
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Failed to verify payment" });
  }
});

// Get payment status
router.get("/status/:transactionId", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
      .populate('product', 'name description imageUrl')
      .populate('seller', 'name displayName');

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Verify user has access to this transaction
    if (transaction.buyer.toString() !== req.user._id.toString() && 
        transaction.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({ success: false, message: "Failed to fetch payment status" });
  }
});

// Razorpay webhook handler
router.post("/webhook", async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const event = req.body;

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    res.json({ success: true, message: "Webhook processed" });

  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
});

// Handle payment captured webhook
async function handlePaymentCaptured(payment) {
  try {
    const transaction = await Transaction.findOne({ 
      razorpayOrderId: payment.order_id 
    });

    if (transaction) {
      transaction.paymentStatus = 'captured';
      transaction.status = 'payment_completed';
      transaction.razorpayPaymentId = payment.id;
      await transaction.save();
    }
  } catch (error) {
    console.error("Error handling payment captured:", error);
  }
}

// Handle payment failed webhook
async function handlePaymentFailed(payment) {
  try {
    const transaction = await Transaction.findOne({ 
      razorpayOrderId: payment.order_id 
    });

    if (transaction) {
      transaction.paymentStatus = 'failed';
      transaction.status = 'payment_failed';
      transaction.razorpayPaymentId = payment.id;
      await transaction.save();
    }
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
}

export default router; 