// backend/routes/product.js
import express from "express";
import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";
import Product from "../models/product.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Multer config for multiple images
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET /products - Get all products (only available ones)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true, quantity: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .populate('seller', 'name displayName googleId email');
    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
});

// GET /products/:id - Get a single product by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id)
      .populate('seller', 'name displayName googleId email profilePicture createdAt');
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch product" 
    });
  }
});

// POST /products/add
router.post("/add", upload.array("images", 5), async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    console.log("Received files:", req.files);
    
    const { name, description, price, category, condition, quantity } = req.body;
    const sellerId = req.user?._id;

    if (!sellerId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    if (!name || !description || !price) {
      console.log("Missing required fields:", { name, description, price });
      return res.status(400).json({ 
        success: false, 
        message: "Name, description, and price are required" 
      });
    }

    // Validate quantity
    const productQuantity = parseInt(quantity) || 1;
    if (productQuantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: "Quantity must be at least 1" 
      });
    }

    // Check if Cloudinary credentials are configured
    const hasCloudinaryConfig = process.env.CLOUDINARY_CLOUD_NAME && 
                               process.env.CLOUDINARY_API_KEY && 
                               process.env.CLOUDINARY_API_SECRET &&
                               process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name';

    let imageUrls = ['https://placehold.co/300x200?text=Product+Image'];

    if (hasCloudinaryConfig && req.files && req.files.length > 0) {
      // Upload multiple images to Cloudinary
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { 
              resource_type: "image",
              folder: "campuskart/products"
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                resolve('https://placehold.co/300x200?text=Product+Image');
              } else {
                console.log("Cloudinary upload successful:", result.secure_url);
                resolve(result.secure_url);
              }
            }
          );
          uploadStream.end(file.buffer);
        });
      });

      imageUrls = await Promise.all(uploadPromises);
    }

    // Save product to DB
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category: category || 'other',
      condition: condition || 'good',
      quantity: productQuantity,
      imageUrls: imageUrls,
      seller: sellerId
    });

    await product.save();
    await product.populate('seller', 'name displayName googleId email');
    console.log("Product saved to database:", product);
    
    res.status(201).json({ 
      success: true, 
      message: "Product added successfully", 
      product 
    });
  } catch (err) {
    console.error("Server error in /add:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + err.message
    });
  }
});

// PUT /products/:id - Update a product
router.put("/:id", upload.array("images", 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, condition, existingImages } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Check if user is the owner of the product
    if (product.seller.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only edit your own products" 
      });
    }

    // Validate required fields
    if (!name || !description || !price) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, description, and price are required" 
      });
    }

    // Check if Cloudinary credentials are configured
    const hasCloudinaryConfig = process.env.CLOUDINARY_CLOUD_NAME && 
                               process.env.CLOUDINARY_API_KEY && 
                               process.env.CLOUDINARY_API_SECRET &&
                               process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name';

    let imageUrls = product.imageUrls || [product.imageUrl];

    // Parse existing images if provided
    if (existingImages) {
      try {
        const parsedExistingImages = JSON.parse(existingImages);
        imageUrls = parsedExistingImages.filter(url => url && url.trim() !== '');
      } catch (e) {
        console.error("Error parsing existing images:", e);
      }
    }

    // Handle new image uploads if provided
    if (hasCloudinaryConfig && req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { 
              resource_type: "image",
              folder: "campuskart/products"
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                resolve('https://placehold.co/300x200?text=Product+Image');
              } else {
                console.log("Cloudinary upload successful:", result.secure_url);
                resolve(result.secure_url);
              }
            }
          );
          uploadStream.end(file.buffer);
        });
      });

      const newImageUrls = await Promise.all(uploadPromises);
      imageUrls = [...imageUrls, ...newImageUrls];
    }

    // Ensure we have at least one image
    if (imageUrls.length === 0) {
      imageUrls = ['https://placehold.co/300x200?text=Product+Image'];
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price: parseFloat(price),
        category,
        condition,
        imageUrls,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('seller', 'name displayName googleId email');

    res.json({ 
      success: true, 
      message: "Product updated successfully", 
      product: updatedProduct 
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update product" 
    });
  }
});

// DELETE /products/:id - Delete a product
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Check if user is the owner of the product
    if (product.seller.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own products" 
      });
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    res.json({ 
      success: true, 
      message: "Product deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete product" 
    });
  }
});

// POST /products/:id/relist - Re-list a sold-out product
router.post("/:id/relist", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Check if user is the owner of the product
    if (product.seller.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only re-list your own products" 
      });
    }

    // Check if product is actually sold out
    if (product.quantity > 0 || product.isAvailable) {
      return res.status(400).json({ 
        success: false, 
        message: "Product is not sold out" 
      });
    }

    // Validate quantity
    const newQuantity = parseInt(quantity) || 1;
    if (newQuantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: "Quantity must be at least 1" 
      });
    }

    // Re-list the product
    product.quantity = newQuantity;
    product.isAvailable = true;
    product.soldOutNotified = false;
    product.updatedAt = new Date();

    await product.save();
    await product.populate('seller', 'name displayName googleId email');

    res.json({ 
      success: true, 
      message: "Product re-listed successfully", 
      product 
    });
  } catch (err) {
    console.error("Error re-listing product:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to re-list product" 
    });
  }
});

// GET /products/seller/:sellerId - Get all products by a specific seller (including sold out)
router.get("/seller/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    const products = await Product.find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .populate('seller', 'name displayName googleId email');
    
    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("Error fetching seller products:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch seller products" 
    });
  }
});

// Debug endpoint to check product status
router.get("/debug/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    res.json({
      success: true,
      product: {
        _id: product._id,
        name: product.name,
        quantity: product.quantity,
        isAvailable: product.isAvailable,
        soldOutNotified: product.soldOutNotified,
        seller: product.seller,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    });
  } catch (err) {
    console.error("Error in debug endpoint:", err);
    res.status(500).json({ success: false, message: "Debug endpoint error" });
  }
});

// Test endpoint to mark product as sold out (for testing only)
router.put("/:id/test-sold-out", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    if (product.seller.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only modify your own products" 
      });
    }

    // Mark as sold out for testing
    product.quantity = 0;
    product.isAvailable = false;
    product.soldOutNotified = true;

    await product.save();

    res.json({ 
      success: true, 
      message: "Product marked as sold out for testing", 
      product 
    });
  } catch (err) {
    console.error("Error marking product as sold out:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to mark product as sold out" 
    });
  }
});

export default router;
