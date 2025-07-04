import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ChatModal from '../components/ChatModal.jsx';
import ProfileDropdown from '../components/ProfileDropdown.jsx';
import ImageGallery from '../components/ImageGallery.jsx';

const Chats = () => {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatModal, setChatModal] = useState({
    isOpen: false,
    product: null,
    otherUser: null
  });

  // Fetch user and conversations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user data
        const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/auth/login/success`, { 
          withCredentials: true 
        });
        setUser(userRes.data.user);
        
        // Fetch conversations
        const conversationsRes = await axios.get(`${import.meta.env.VITE_API_URL}/chat/conversations`, {
          withCredentials: true
        });
        
        if (conversationsRes.data.success) {
          setConversations(conversationsRes.data.conversations);
        } else {
          setError("Failed to fetch conversations");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401) {
          setError("Please login to view your chats");
        } else {
          setError("Failed to load conversations");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChat = (conversation) => {
    setChatModal({
      isOpen: true,
      product: conversation._id.product,
      otherUser: conversation._id.otherUser
    });
  };

  const closeChatModal = () => {
    setChatModal({
      isOpen: false,
      product: null,
      otherUser: null
    });
  };

  const handleMessageSent = () => {
    // Refresh conversations after sending a message
    loadConversations();
  };

  const loadConversations = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/chat/conversations`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <p className="text-red-500 mb-4">{error}</p>
          <Link to="/login" className="text-blue-600 hover:text-blue-800">
            Login to continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-0 md:p-8">
          {/* Header */}
          <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-3xl">
            <h1 className="text-3xl font-bold text-blue-800 mb-2 flex items-center gap-2">
              <span>💬</span> My Conversations
            </h1>
            <p className="text-gray-500">
              Chat with buyers and sellers about your products
            </p>
          </div>

          {/* Conversations List */}
          <div className="p-6">
            {conversations.length > 0 ? (
              <div className="space-y-4">
                {conversations.map((conversation) => {
                  const otherUser = conversation._id.otherUser;
                  const product = conversation._id.product;
                  const lastMessage = conversation.lastMessage;
                  const isFromMe = lastMessage.sender._id === user._id;
                  const unread = conversation.unreadCount || 0;
                  return (
                    <div
                      key={`${conversation._id.product._id}-${conversation._id.otherUser._id}`}
                      className="bg-white/90 backdrop-blur border border-blue-100 rounded-2xl p-4 flex items-center gap-4 shadow hover:shadow-lg transition cursor-pointer hover:bg-blue-50"
                      onClick={() => handleChat(conversation)}
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-blue-100 bg-gradient-to-br from-blue-100 to-purple-100">
                        <ImageGallery 
                          images={product.imageUrls || [product.imageUrl]} 
                          productName={product.name}
                          compact={true}
                        />
                      </div>
                      {/* Conversation Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <img
                              src={otherUser.profilePicture || 'https://placehold.co/32x32?text=U'}
                              alt={otherUser.displayName || otherUser.name}
                              className="w-8 h-8 rounded-full object-cover border border-blue-200"
                            />
                            <span className="font-semibold text-blue-700 text-base">
                              {otherUser.displayName || otherUser.name}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">{formatTime(lastMessage.timestamp)}</span>
                          </div>
                          {unread > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                              {unread > 9 ? '9+' : unread}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 font-medium truncate max-w-xs">{product.name}</span>
                        </div>
                        <div className="text-gray-500 text-sm truncate max-w-xs">
                          {isFromMe ? <span className="text-blue-500 font-semibold">You: </span> : null}
                          {lastMessage.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500">No conversations yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={chatModal.isOpen}
        onClose={closeChatModal}
        product={chatModal.product}
        currentUser={user}
        otherUser={chatModal.otherUser}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
};

export default Chats; 