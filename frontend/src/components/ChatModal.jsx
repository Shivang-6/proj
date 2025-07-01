import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const ChatModal = ({ isOpen, onClose, product, currentUser, otherUser, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (isOpen && currentUser && otherUser && product) {
      const newSocket = io(import.meta.env.VITE_API_URL, {
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        setIsConnected(true);
        // Join chat room
        newSocket.emit('join-chat', {
          productId: product._id,
          userId1: currentUser._id,
          userId2: otherUser._id
        });
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        alert('Failed to connect to chat server. Please try again.');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          // the disconnection was initiated by the server, reconnect manually
          newSocket.connect();
        }
      });

      newSocket.on('new-message', (message) => {
        setMessages(prev => [...prev, message]);
        
        // Call the callback to refresh conversations if this is a new message from the other user
        if (message.sender !== currentUser._id && onMessageSent) {
          onMessageSent();
        }
      });

      newSocket.on('user-typing', (data) => {
        if (data.userId !== currentUser._id) {
          setTyping(true);
          setTimeout(() => setTyping(false), 3000);
        }
      });

      newSocket.on('message-error', (error) => {
        console.error('Message error:', error);
        alert('Failed to send message. Please try again.');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, currentUser, otherUser, product]);

  // Load chat history
  useEffect(() => {
    if (isOpen && currentUser && otherUser && product) {
      loadChatHistory();
    }
  }, [isOpen, currentUser, otherUser, product]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/chat/history/${product._id}/${otherUser._id}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      senderId: currentUser._id,
      receiverId: otherUser._id,
      productId: product._id,
      content: newMessage.trim()
    };

    socket.emit('send-message', messageData);
    setNewMessage('');
    
    // Call the callback to refresh conversations if provided
    if (onMessageSent) {
      onMessageSent();
    }
  };

  const handleTyping = () => {
    if (!socket) return;

    socket.emit('typing', {
      productId: product._id,
      senderId: currentUser._id,
      receiverId: otherUser._id
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      // Stop typing indicator
    }, 1000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-12 h-12 rounded object-cover border"
              onError={(e) => {
                e.target.src = 'https://placehold.co/48x48?text=No+Image';
              }}
            />
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
              <p className="text-sm text-gray-500">
                Chat with {otherUser.displayName || otherUser.name}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-500">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 text-4xl mb-4">💬</div>
                <p className="text-gray-500 text-lg mb-2">No messages yet</p>
                <p className="text-gray-400">Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isFromCurrentUser = message.sender === currentUser._id;
              const senderName = isFromCurrentUser 
                ? (currentUser.displayName || currentUser.name)
                : (otherUser.displayName || otherUser.name);
              
              return (
                <div
                  key={message._id || message.id}
                  className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${isFromCurrentUser ? 'order-2' : 'order-1'}`}>
                    {/* User Avatar and Name */}
                    <div className={`flex items-center space-x-2 mb-1 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      {!isFromCurrentUser && (
                        <img
                          src={otherUser.profilePicture || "https://placehold.co/24x24?text=U"}
                          alt={senderName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                      <span className="text-xs text-gray-500 font-medium">
                        {senderName}
                      </span>
                      {isFromCurrentUser && (
                        <img
                          src={currentUser.profilePicture || "https://placehold.co/24x24?text=U"}
                          alt={senderName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                    </div>
                    
                    {/* Message Bubble */}
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm ${
                        isFromCurrentUser
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    </div>
                    
                    {/* Timestamp */}
                    <div className={`mt-1 ${isFromCurrentUser ? 'text-right' : 'text-left'}`}>
                      <p className={`text-xs ${
                        isFromCurrentUser ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {typing && (
            <div className="flex justify-start">
              <div className="max-w-xs">
                <div className="flex items-center space-x-2 mb-1">
                  <img
                    src={otherUser.profilePicture || "https://placehold.co/24x24?text=U"}
                    alt={otherUser.displayName || otherUser.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs text-gray-500 font-medium">
                    {otherUser.displayName || otherUser.name}
                  </span>
                </div>
                <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md border border-gray-200 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                } else {
                  handleTyping();
                }
              }}
              placeholder={`Type a message to ${otherUser.displayName || otherUser.name}...`}
              className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected}
              className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center"
            >
              {!isConnected ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal; 