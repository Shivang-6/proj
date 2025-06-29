import express from "express";
import Message from "../models/message.js";
import Product from "../models/product.js";

const router = express.Router();

// Get chat history for a specific product between two users
router.get("/history/:productId/:otherUserId", async (req, res) => {
  try {
    const { productId, otherUserId } = req.params;
    const currentUserId = req.user?._id;

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const messages = await Message.find({
      product: productId,
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
    .sort({ timestamp: 1 })
    .populate('sender', 'name googleId')
    .populate('receiver', 'name googleId');

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ success: false, message: "Failed to fetch chat history" });
  }
});

// Get all chat conversations for current user
router.get("/conversations", async (req, res) => {
  try {
    const currentUserId = req.user?._id;

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // Get all conversations where user is either sender or receiver
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ]
        }
      },
      {
        $group: {
          _id: {
            product: "$product",
            otherUser: {
              $cond: [
                { $eq: ["$sender", currentUserId] },
                "$receiver",
                "$sender"
              ]
            }
          },
          lastMessage: { $last: "$$ROOT" },
          messageCount: { $sum: 1 }
        }
      },
      {
        $sort: { "lastMessage.timestamp": -1 }
      }
    ]);

    // Populate product and user details
    const populatedConversations = await Message.populate(conversations, [
      { path: '_id.product', model: 'Product', select: 'name imageUrl price' },
      { path: '_id.otherUser', model: 'User', select: 'name googleId' },
      { path: 'lastMessage.sender', model: 'User', select: 'name googleId' },
      { path: 'lastMessage.receiver', model: 'User', select: 'name googleId' }
    ]);

    res.json({ success: true, conversations: populatedConversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ success: false, message: "Failed to fetch conversations" });
  }
});

// Mark messages as read
router.put("/read/:productId/:otherUserId", async (req, res) => {
  try {
    const { productId, otherUserId } = req.params;
    const currentUserId = req.user?._id;

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    await Message.updateMany(
      {
        product: productId,
        sender: otherUserId,
        receiver: currentUserId,
        read: false
      },
      { read: true }
    );

    res.json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ success: false, message: "Failed to mark messages as read" });
  }
});

export default router; 