import express from "express";
import Notification from "../models/notification.js";

const router = express.Router();

// GET /notifications - Get user's notifications
router.get("/", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const notifications = await Notification.find({ user: req.user._id })
      .populate('product', 'name imageUrl')
      .populate('transaction', 'price status')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
});

// GET /notifications/unread - Get unread notifications count
router.get("/unread", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const count = await Notification.countDocuments({ 
      user: req.user._id, 
      isRead: false 
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ success: false, message: "Failed to fetch unread count" });
  }
});

// PUT /notifications/:id/read - Mark notification as read
router.put("/:id/read", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    // Check if user owns this notification
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Failed to mark notification as read" });
  }
});

// PUT /notifications/read-all - Mark all notifications as read
router.put("/read-all", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ success: false, message: "Failed to mark notifications as read" });
  }
});

// DELETE /notifications/:id - Delete a notification
router.delete("/:id", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    // Check if user owns this notification
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Notification.findByIdAndDelete(id);

    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Failed to delete notification" });
  }
});

export default router; 