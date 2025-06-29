import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'payment_initiated', 'payment_completed', 'payment_failed', 'completed', 'cancelled'],
    default: 'pending'
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'razorpay', 'other'],
    default: 'cash'
  },
  // Razorpay specific fields
  razorpayOrderId: {
    type: String,
    sparse: true
  },
  razorpayPaymentId: {
    type: String,
    sparse: true
  },
  razorpaySignature: {
    type: String,
    sparse: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'captured', 'failed', 'refunded'],
    default: 'pending'
  },
  notes: String
});

export default mongoose.model("Transaction", transactionSchema); 