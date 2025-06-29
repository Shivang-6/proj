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
        const userRes = await axios.get("http://localhost:5000/auth/login/success", { 
          withCredentials: true 
        });
        setUser(userRes.data.user);
        
        // Fetch conversations
        const conversationsRes = await axios.get("http://localhost:5000/chat/conversations", {
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
      const response = await axios.get("http://localhost:5000/chat/conversations", {
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
      {/* Navbar */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/landing" className="text-2xl font-bold text-blue-600">
            CampusKart
          </Link>
          <nav className="flex gap-4 items-center">
            <Link
              to="/sell"
              className="text-green-600 hover:text-green-800 font-medium transition"
            >
              Sell Product
            </Link>
            <Link
              to="/landing"
              className="text-blue-600 hover:text-blue-800 font-medium transition"
            >
              Marketplace
            </Link>
            {user && <ProfileDropdown user={user} />}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">My Conversations</h1>
            <p className="text-gray-600">
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
                  
                  return (
                    <div
                      key={`${conversation._id.product._id}-${conversation._id.otherUser._id}`}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                      onClick={() => handleChat(conversation)}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden">
                          <ImageGallery 
                            images={product.imageUrls || [product.imageUrl]} 
                            productName={product.name}
                            compact={true}
                          />
                        </div>
                        
                        {/* Conversation Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <img
                                src={otherUser.profilePicture || "https://placehold.co/40x40?text=U"}
                                alt={otherUser.displayName || otherUser.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                              />
                              <div>
                                <h3 className="font-semibold text-gray-800">
                                  {otherUser.displayName || otherUser.name}
                                </h3>
                                <Link 
                                  to={`/product/${product._id}`}
                                  className="text-sm text-gray-500 hover:text-blue-600 transition"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {product.name}
                                </Link>
                              </div>
                            </div>
                            <span className="text-sm text-gray-400">
                              {formatTime(lastMessage.timestamp)}
                            </span>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                            <p className="text-gray-700 text-sm line-clamp-2 mb-2">
                              <span className={`font-medium ${isFromMe ? 'text-blue-600' : 'text-gray-800'}`}>
                                {isFromMe ? 'You: ' : `${otherUser.displayName || otherUser.name}: `}
                              </span>
                              {lastMessage.content}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                {formatDate(lastMessage.timestamp)}
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                ₹{product.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No conversations yet</h3>
                <p className="text-gray-600 mb-6">
                  Start chatting with buyers and sellers about products
                </p>
                <div className="space-x-4">
                  <Link
                    to="/landing"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Browse Products
                  </Link>
                  <Link
                    to="/sell"
                    className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Sell a Product
                  </Link>
                </div>
              </div>
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