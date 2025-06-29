import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/product.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campuskart')
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

async function migrateImages() {
  try {
    console.log('Starting image migration...');
    
    // Find all products that have imageUrl but empty imageUrls
    const products = await Product.find({
      $or: [
        { imageUrls: { $exists: false } },
        { imageUrls: { $size: 0 } }
      ]
    });

    console.log(`Found ${products.length} products to migrate`);

    for (const product of products) {
      if (product.imageUrl && (!product.imageUrls || product.imageUrls.length === 0)) {
        product.imageUrls = [product.imageUrl];
        await product.save();
        console.log(`Migrated product: ${product.name}`);
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateImages(); 