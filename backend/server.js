import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import productRoutes from "./routes/product.js";
import chatRoutes from "./routes/chat.js";
import profileRoutes from "./routes/profile.js";
import transactionRoutes from "./routes/transactions.js";
import paymentRoutes from "./routes/payment.js";
import notificationRoutes from "./routes/notifications.js";
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import './auth/passport.js';

dotenv.config();

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// 🔧 Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔐 Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecurekey123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// 🧠 Passport middlewares
app.use(passport.initialize());
app.use(passport.session());

// 🌐 CORS setup
app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:5173', 
  credentials: true 
}));

// 🔗 Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/chat", chatRoutes);
app.use("/profile", profileRoutes);
app.use("/transactions", transactionRoutes);
app.use("/payment", paymentRoutes);
app.use("/notifications", notificationRoutes);

// 📦 MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campuskart')
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// 🚨 Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a chat room for a specific product
  socket.on('join-chat', (data) => {
    try {
      const roomId = `product-${data.productId}-${data.userId1}-${data.userId2}`;
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    } catch (error) {
      console.error('Error joining chat room:', error);
      socket.emit('error', { message: 'Failed to join chat room' });
    }
  });

  // Handle new message
  socket.on('send-message', async (data) => {
    try {
      console.log('Received message data:', data);
      
      // Validate required fields
      if (!data.senderId || !data.receiverId || !data.productId || !data.content) {
        throw new Error('Missing required message fields');
      }

      // Save message to database
      const Message = mongoose.model('Message');
      const message = new Message({
        sender: data.senderId,
        receiver: data.receiverId,
        product: data.productId,
        content: data.content
      });
      await message.save();

      // Emit message to all users in the chat room
      const roomId = `product-${data.productId}-${data.senderId}-${data.receiverId}`;
      const altRoomId = `product-${data.productId}-${data.receiverId}-${data.senderId}`;
      
      const messageData = {
        id: message._id,
        sender: data.senderId,
        receiver: data.receiverId,
        product: data.productId,
        content: data.content,
        timestamp: message.timestamp
      };

      io.to(roomId).emit('new-message', messageData);
      io.to(altRoomId).emit('new-message', messageData);

      console.log('Message sent successfully:', data.content);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('message-error', { message: 'Failed to send message: ' + error.message });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    try {
      const roomId = `product-${data.productId}-${data.senderId}-${data.receiverId}`;
      socket.to(roomId).emit('user-typing', { userId: data.senderId });
    } catch (error) {
      console.error('Error handling typing indicator:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
server.listen(PORT, () => {
  console.log(`🚀 Server running on ${SERVER_URL}`);
  console.log(`🔌 Socket.IO server ready`);
});
