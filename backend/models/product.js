// backend/models/product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  imageUrl: String, // Keep for backward compatibility
  imageUrls: [String], // New field for multiple images
  quantity: {
    type: Number,
    default: 1,
    min: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['electronics', 'books', 'clothing', 'sports', 'furniture', 'other'],
    default: 'other'
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'poor'],
    default: 'good'
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  soldOutNotified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to ensure imageUrls has at least one image
productSchema.pre('save', function(next) {
  if (this.imageUrls && this.imageUrls.length > 0) {
    // Set the first image as the main imageUrl for backward compatibility
    this.imageUrl = this.imageUrls[0];
  } else if (this.imageUrl && (!this.imageUrls || this.imageUrls.length === 0)) {
    // If only imageUrl exists, create imageUrls array
    this.imageUrls = [this.imageUrl];
  } else if (!this.imageUrl && (!this.imageUrls || this.imageUrls.length === 0)) {
    // If neither exists, set a default placeholder
    this.imageUrl = 'https://placehold.co/300x200?text=Product+Image';
    this.imageUrls = [this.imageUrl];
  }
  
  // Update availability based on quantity
  this.isAvailable = this.quantity > 0;
  
  // Update timestamp
  this.updatedAt = new Date();
  
  next();
});

export default mongoose.model("Product", productSchema);
