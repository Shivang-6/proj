import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ChatModal from '../components/ChatModal.jsx';
import ProfileDropdown from '../components/ProfileDropdown.jsx';
import EditProductModal from '../components/EditProductModal.jsx';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal.jsx';
import PaymentModal from '../components/PaymentModal.jsx';
import PaymentSuccessModal from '../components/PaymentSuccessModal.jsx';
import ImageGallery from '../components/ImageGallery.jsx';
import { FaStar } from 'react-icons/fa';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [chatConversations, setChatConversations] = useState([]);
  const [showChatList, setShowChatList] = useState(false);
  
  // Modal states
  const [chatModal, setChatModal] = useState({
    isOpen: false,
    product: null,
    otherUser: null
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    product: null
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    product: null
  });
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    product: null
  });
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    transaction: null
  });

  // Review state
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);
  const [canReview, setCanReview] = useState(false);

  // Local state for editing review
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  const [reviewCount, setReviewCount] = useState(0);

  // Fetch user and product data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user data
        const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/auth/login/success`, { withCredentials: true });
        setUser(userRes.data.user);
        
        // Fetch product data
        const productRes = await axios.get(`${import.meta.env.VITE_API_URL}/products/${productId}`, { withCredentials: true });
        if (productRes.data.success) {
          setProduct(productRes.data.product);
          setReviewCount(productRes.data.reviewCount || 0);
          
          // Fetch related products
          const relatedRes = await axios.get(`${import.meta.env.VITE_API_URL}/products?category=${productRes.data.product.category}&limit=4&exclude=${productId}`, { withCredentials: true });
          if (relatedRes.data.success) {
            setRelatedProducts(relatedRes.data.products);
          }

          // If user is the seller, fetch chat conversations for this product
          if (userRes.data.user && productRes.data.product.seller && 
              userRes.data.user._id === productRes.data.product.seller._id) {
            loadProductConversations(productRes.data.product._id);
          }
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 404) {
          setError("Product not found");
        } else {
          setError("Failed to load product details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  // Fetch reviews
  useEffect(() => {
    if (!product) return;
    setReviewLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/products/${product._id}/reviews`)
      .then(res => {
        setReviews(res.data.reviews);
        setReviewLoading(false);
      })
      .catch(() => {
        setReviewError("Failed to load reviews");
        setReviewLoading(false);
      });
  }, [product]);

  // Check if user can review
  useEffect(() => {
    if (!user || !product) return;
    axios.get(`${import.meta.env.VITE_API_URL}/products/${product._id}/reviews`)
      .then(res => {
        const already = res.data.reviews.some(r => r.user && r.user._id === user._id);
        setHasReviewed(already);
      });
    // Check if user purchased (by trying to post a dummy review and catching 403)
    axios.post(`${import.meta.env.VITE_API_URL}/products/${product._id}/review`, { rating: 5, comment: "dummy" }, { withCredentials: true })
      .then(() => setCanReview(true))
      .catch(err => {
        if (err.response && err.response.status === 403) setCanReview(false);
        else setCanReview(true);
      });
  }, [user, product]);

  // Average rating
  const avgRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : null;

  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSuccess("");
    setReviewError("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/products/${product._id}/review`,
        { rating, comment },
        { withCredentials: true }
      );
      setReviewSuccess("Review submitted!");
      setReviews(prev => [...prev, res.data.review]);
      setHasReviewed(true);
      setRating(0);
      setComment("");
    } catch (err) {
      if (err.response?.status === 409) {
        setReviewError("You have already reviewed this product.");
      } else {
        setReviewError(err.response?.data?.message || "Failed to submit review");
      }
    }
  };

  const loadProductConversations = async (productId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/chat/conversations`, { withCredentials: true });
      
      if (response.data.success) {
        // Filter conversations for this specific product
        const productConversations = response.data.conversations.filter(
          conv => conv._id.product._id === productId
        );
        setChatConversations(productConversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const handleChat = () => {
    if (!user) {
      alert("Please login to chat with the seller");
      return;
    }

    if (!product.seller) {
      alert("Seller information not available");
      return;
    }

    if (product.seller._id === user._id) {
      alert("You cannot chat with yourself");
      return;
    }

    setChatModal({
      isOpen: true,
      product: product,
      otherUser: product.seller
    });
  };

  const handleEdit = () => {
    setEditModal({
      isOpen: true,
      product: product
    });
  };

  const handleDelete = () => {
    setDeleteModal({
      isOpen: true,
      product: product
    });
  };

  const handleContactSeller = () => {
    if (!user) {
      alert("Please login to contact the seller");
      return;
    }
    setShowContactInfo(true);
  };

  const handleChatWithBuyer = (buyer) => {
    setChatModal({
      isOpen: true,
      product: product,
      otherUser: buyer
    });
  };

  const handleViewAllChats = () => {
    setShowChatList(!showChatList);
  };

  const closeChatModal = () => {
    setChatModal({
      isOpen: false,
      product: null,
      otherUser: null
    });
  };

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      product: null
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      product: null
    });
  };

  const handleProductUpdated = (updatedProduct) => {
    setProduct(updatedProduct);
  };

  const handleProductDeleted = () => {
    navigate('/landing');
  };

  const handleChatMessageSent = () => {
    // Refresh conversations after sending a message
    if (isProductOwner()) {
      loadProductConversations(product._id);
    }
  };

  const isProductOwner = () => {
    return user && product?.seller && product.seller._id === user._id;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getConditionBadge = (condition) => {
    const badges = {
      'new': { text: 'New', color: 'bg-green-100 text-green-800' },
      'like-new': { text: 'Like New', color: 'bg-blue-100 text-blue-800' },
      'good': { text: 'Good', color: 'bg-yellow-100 text-yellow-800' },
      'fair': { text: 'Fair', color: 'bg-orange-100 text-orange-800' },
      'poor': { text: 'Poor', color: 'bg-red-100 text-red-800' }
    };
    return badges[condition] || badges['good'];
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'electronics': '📱',
      'books': '📚',
      'clothing': '👕',
      'sports': '⚽',
      'furniture': '🪑',
      'other': '📦'
    };
    return icons[category] || icons['other'];
  };

  const handleBuyNow = () => {
    if (!user) {
      alert("Please login to purchase this product");
      return;
    }

    if (!product.seller) {
      alert("Seller information not available");
      return;
    }

    if (product.seller._id === user._id) {
      alert("You cannot buy your own product");
      return;
    }

    setPaymentModal({
      isOpen: true,
      product: product
    });
  };

  const handlePaymentSuccess = (transaction) => {
    setSuccessModal({
      isOpen: true,
      transaction: transaction
    });
  };

  const closePaymentModal = () => {
    setPaymentModal({
      isOpen: false,
      product: null
    });
  };

  const closeSuccessModal = () => {
    setSuccessModal({
      isOpen: false,
      transaction: null
    });
  };

  // Edit review handler
  const handleEditReview = (review) => {
    setEditingReview(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };
  const handleUpdateReview = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/products/${product._id}/review`,
        { rating: editRating, comment: editComment },
        { withCredentials: true }
      );
      setReviews(reviews.map(r => r._id === editingReview ? res.data.review : r));
      setEditingReview(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update review");
    }
  };
  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${product._id}/review`, { withCredentials: true });
      setReviews(reviews.filter(r => !(r.user && r.user._id === user._id)));
      setHasReviewed(false);
      setCanReview(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete review");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading product details...</p>
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
          <Link to="/landing" className="text-blue-600 hover:text-blue-800">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <p className="text-gray-500 mb-4">Product not found</p>
          <Link to="/landing" className="text-blue-600 hover:text-blue-800">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const conditionBadge = getConditionBadge(product.condition);
  const categoryIcon = getCategoryIcon(product.category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/landing" className="text-gray-700 hover:text-blue-600">
                Marketplace
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-gray-500 md:ml-2">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Product Details */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Product Header */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{categoryIcon}</span>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${conditionBadge.color}`}>
                      {conditionBadge.text}
                    </span>
                    <span className="text-sm text-gray-500 capitalize">
                      {product.category || 'Other'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end space-x-2 mb-2">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: product.name,
                          text: `Check out this ${product.name} on CampusKart for ₹${product.price}!`,
                          url: window.location.href
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Product link copied to clipboard!');
                      }
                    }}
                    className="text-gray-500 hover:text-blue-600 transition p-2 rounded-full hover:bg-blue-50"
                    title="Share Product"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Product link copied to clipboard!');
                    }}
                    className="text-gray-500 hover:text-blue-600 transition p-2 rounded-full hover:bg-blue-50"
                    title="Copy Link"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-500">Listed on</p>
                <p className="text-sm font-medium">{formatDate(product.createdAt)}</p>
                {product.updatedAt && product.updatedAt !== product.createdAt && (
                  <>
                    <p className="text-sm text-gray-500 mt-1">Updated on</p>
                    <p className="text-sm font-medium">{formatDate(product.updatedAt)}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Product Content */}
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2 p-6">
              <ImageGallery images={product?.imageUrls} productName={product?.name} />
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-6">
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Product Details */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium capitalize flex items-center">
                      {categoryIcon} {product.category || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${conditionBadge.color}`}>
                      {conditionBadge.text}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-green-600 text-lg">₹{product.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">Campus Area</span>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              {product.seller && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Seller Information</h3>
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.seller.profilePicture || "https://placehold.co/48x48?text=U"}
                      alt={product.seller.displayName || product.seller.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/48x48?text=U';
                      }}
                    />
                    <div className="flex-1">
                      <Link 
                        to={`/profile/${product.seller._id}`}
                        className="text-lg font-medium text-blue-600 hover:text-blue-800"
                      >
                        {product.seller.displayName || product.seller.name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        Member since {formatDate(product.seller.createdAt || new Date())}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500">⭐ 4.8 (12 reviews)</span>
                        <span className="text-xs text-gray-500">📦 5 items sold</span>
                        <span className="text-xs text-gray-500">📍 Campus Area</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Info (for buyers) */}
                  {!isProductOwner() && user && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <button
                        onClick={handleContactSeller}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {showContactInfo ? 'Hide' : 'Show'} Contact Information
                      </button>
                      {showContactInfo && (
                        <div className="mt-2 p-3 bg-white rounded border">
                          <p className="text-sm text-gray-600">
                            <strong>Email:</strong> {product.seller.email || 'Not available'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Phone:</strong> {product.seller.phoneNumber || 'Not available'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Response Time:</strong> Usually responds within 2 hours
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Product Status */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Availability:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Available
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="text-sm font-medium">Local Pickup Only</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Returns:</span>
                    <span className="text-sm font-medium">Not Accepted</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <span className="text-sm font-medium">Cash on Pickup</span>
                  </div>
                </div>
              </div>

              {/* Chat Conversations for Sellers */}
              {isProductOwner() && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Buyer Inquiries</h3>
                  
                  {chatConversations.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">
                          {chatConversations.length} active conversation{chatConversations.length !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={handleViewAllChats}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {showChatList ? 'Hide' : 'View'} conversations
                        </button>
                      </div>
                      
                      {showChatList && (
                        <div className="space-y-3">
                          {chatConversations.map((conversation) => {
                            const buyer = conversation._id.otherUser;
                            const lastMessage = conversation.lastMessage;
                            const isFromBuyer = lastMessage.sender._id === buyer._id;
                            
                            return (
                              <div key={conversation._id.otherUser._id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <img
                                      src={buyer.profilePicture || "https://placehold.co/40x40?text=U"}
                                      alt={buyer.displayName || buyer.name}
                                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                                      onError={(e) => {
                                        e.target.src = 'https://placehold.co/40x40?text=U';
                                      }}
                                    />
                                    <div>
                                      <h4 className="font-semibold text-gray-800">
                                        {buyer.displayName || buyer.name}
                                      </h4>
                                      <p className="text-xs text-gray-500">
                                        {isFromBuyer ? 'Buyer' : 'You'} • {formatDate(lastMessage.timestamp)}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleChatWithBuyer(buyer)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                  >
                                    Chat
                                  </button>
                                </div>
                                <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                                  <p className="text-sm text-gray-700 line-clamp-2">
                                    <span className="font-medium text-gray-800">
                                      {isFromBuyer ? `${buyer.displayName || buyer.name}: ` : 'You: '}
                                    </span>
                                    {lastMessage.content}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {!showChatList && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">
                            You have {chatConversations.length} active conversation{chatConversations.length !== 1 ? 's' : ''}
                          </p>
                          <button
                            onClick={handleViewAllChats}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View conversations
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-gray-400 text-4xl mb-2">💬</div>
                      <p className="text-gray-600 mb-2">No buyer inquiries yet</p>
                      <p className="text-sm text-gray-500">
                        When buyers are interested in your product, their messages will appear here.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {isProductOwner() ? (
                  // Owner actions
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <button
                        onClick={handleEdit}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Product
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Product
                      </button>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">This is your product</p>
                    </div>
                  </div>
                ) : (
                  // Buyer actions
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <button
                        onClick={handleChat}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat with Seller
                      </button>
                      <button
                        onClick={handleBuyNow}
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                        Buy Now
                      </button>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Interested? Chat with the seller or buy directly!</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Product ID: {product._id}</span>
                  <span>Views: {product.views || 0}</span>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="p-6 border-t">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  Reviews
                  {avgRating && (
                    <span className="flex items-center gap-1 text-yellow-500 text-lg font-semibold">
                      {avgRating}
                      <FaStar />
                      <span className="text-gray-500 ml-1">({reviewCount})</span>
                    </span>
                  )}
                  <span className="text-gray-500 text-base">({reviewCount})</span>
                </h3>
                {reviewLoading ? (
                  <div className="text-gray-500">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="text-gray-500">No reviews yet.</div>
                ) : (
                  <div className="space-y-4 mb-6">
                    {reviews.map(r => (
                      <div key={r._id} className="bg-gray-50 rounded p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-yellow-500 flex items-center">
                            {[...Array(r.rating)].map((_, i) => <FaStar key={i} />)}
                          </span>
                          <span className="font-semibold text-gray-800">{r.user?.displayName || r.user?.name || 'User'}</span>
                          <span className="text-xs text-gray-400 ml-2">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
                          {user && r.user && r.user._id === user._id && !editingReview && (
                            <>
                              <button onClick={() => handleEditReview(r)} className="ml-2 text-blue-600 hover:underline text-xs">Edit</button>
                              <button onClick={handleDeleteReview} className="ml-2 text-red-500 hover:underline text-xs">Delete</button>
                            </>
                          )}
                        </div>
                        {editingReview === r._id ? (
                          <form onSubmit={handleUpdateReview} className="mt-2">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">Edit Rating:</span>
                              {[1,2,3,4,5].map(star => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setEditRating(star)}
                                  className={star <= editRating ? 'text-yellow-500' : 'text-gray-300'}
                                >
                                  <FaStar />
                                </button>
                              ))}
                            </div>
                            <textarea
                              className="w-full border rounded p-2 mb-2"
                              value={editComment}
                              onChange={e => setEditComment(e.target.value)}
                              required
                            />
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mr-2">Save</button>
                            <button type="button" onClick={() => setEditingReview(null)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition">Cancel</button>
                          </form>
                        ) : (
                          <div className="text-gray-700">{r.comment}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Review Form */}
                {user && canReview && !hasReviewed && (
                  <form onSubmit={handleReviewSubmit} className="bg-gray-100 rounded p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Your Rating:</span>
                      {[1,2,3,4,5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}
                        >
                          <FaStar />
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="w-full border rounded p-2 mb-2"
                      placeholder="Write your review..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                      disabled={rating === 0}
                    >
                      Submit Review
                    </button>
                    {reviewSuccess && <div className="text-green-600 mt-2">{reviewSuccess}</div>}
                    {reviewError && <div className="text-red-500 mt-2">{reviewError}</div>}
                  </form>
                )}
                {hasReviewed && (
                  <div className="text-green-600">You have already reviewed this product.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Similar Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  to={`/product/${relatedProduct._id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                >
                  <img
                    src={relatedProduct.imageUrl}
                    alt={relatedProduct.name}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/300x200?text=No+Image';
                    }}
                  />
                  <div className="p-3">
                    <h4 className="font-medium text-gray-800 text-sm line-clamp-1">{relatedProduct.name}</h4>
                    <p className="text-green-600 font-bold">₹{relatedProduct.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ChatModal
        isOpen={chatModal.isOpen}
        onClose={closeChatModal}
        product={chatModal.product}
        currentUser={user}
        otherUser={chatModal.otherUser}
        onMessageSent={handleChatMessageSent}
      />

      <EditProductModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        product={editModal.product}
        onProductUpdated={handleProductUpdated}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        product={deleteModal.product}
        onProductDeleted={handleProductDeleted}
      />

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={closePaymentModal}
        product={paymentModal.product}
        user={user}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <PaymentSuccessModal
        isOpen={successModal.isOpen}
        onClose={closeSuccessModal}
        transaction={successModal.transaction}
      />
    </div>
  );
};

export default ProductDetail; 