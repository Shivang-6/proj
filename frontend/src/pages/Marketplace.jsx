import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ChatModal from "../components/ChatModal.jsx";
import ProfileDropdown from "../components/ProfileDropdown.jsx";
import EditProductModal from "../components/EditProductModal.jsx";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal.jsx";
import ImageGallery from "../components/ImageGallery.jsx";
import { FaStar, FaSearch, FaFilter, FaSort, FaComments, FaCreditCard, FaShoppingCart, FaUserShield, FaTags } from 'react-icons/fa';
import ProductCard from '../components/ProductCard.jsx';

const Marketplace = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');

  // Fetch logged-in user
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/auth/login/success`, { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch((err) => console.log("Not logged in", err));
  }, []);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/products`, { withCredentials: true });
        if (res.data.success) {
          setProducts(res.data.products);
        } else {
          setError("Failed to fetch products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleChat = (product) => {
    if (!user) {
      alert("Please login to chat with the seller");
      return;
    }

    // Use the actual seller from the product data
    if (!product.seller) {
      alert("Seller information not available");
      return;
    }

    // Don't allow users to chat with themselves
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

  const handleEdit = (product) => {
    setEditModal({
      isOpen: true,
      product: product
    });
  };

  const handleDelete = (product) => {
    setDeleteModal({
      isOpen: true,
      product: product
    });
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
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
  };

  const handleProductDeleted = (productId) => {
    setProducts(prevProducts => 
      prevProducts.filter(product => product._id !== productId)
    );
  };

  const isProductOwner = (product) => {
    return user && product.seller && product.seller._id === user._id;
  };

  // Filter and search products
  const filteredProducts = products.filter(product => {
    // Exclude products listed by the logged-in user
    if (user && product.seller && product.seller._id === user._id) {
      return false;
    }
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice = (!priceRange.min || product.price >= parseInt(priceRange.min)) &&
                        (!priceRange.max || product.price <= parseInt(priceRange.max));
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'newest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gradient mb-6 pb-2 leading-tight">
            {user ? `Welcome back, ${user.displayName || user.name}!` : "Welcome to CampusKart"}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover amazing deals and connect with fellow students. Buy, sell, and trade items within your campus community.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-12">
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">Why Choose CampusKart?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-blue-50 transition">
              <FaComments className="w-8 h-8 text-pink-500" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">In-App Chat</h3>
              <p className="mt-2 text-gray-600 text-base">Chat instantly with buyers and sellers to negotiate, ask questions, and arrange meetups.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-blue-50 transition">
              <FaCreditCard className="w-8 h-8 text-green-500" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">Secure Payments</h3>
              <p className="mt-2 text-gray-600 text-base">Pay securely through integrated payment gateways. Your transactions are protected.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-blue-50 transition">
              <FaShoppingCart className="w-8 h-8 text-blue-500" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">Smart Cart</h3>
              <p className="mt-2 text-gray-600 text-base">Add items to your cart, review, and checkout with ease—just like your favorite e-commerce sites.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-blue-50 transition">
              <FaUserShield className="w-8 h-8 text-purple-500" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">Campus-Only Access</h3>
              <p className="mt-2 text-gray-600 text-base">Only verified campus members can join, ensuring a safe and trusted marketplace.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-blue-50 transition">
              <FaSearch className="w-8 h-8 text-yellow-500" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">Powerful Search</h3>
              <p className="mt-2 text-gray-600 text-base">Find exactly what you need with advanced filters for category, price, and more.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-blue-50 transition">
              <FaTags className="w-8 h-8 text-indigo-500" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">Great Deals</h3>
              <p className="mt-2 text-gray-600 text-base">Discover amazing bargains on books, gadgets, accessories, and more—all from your campus community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Listing */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Latest Listings</h2>
          <div className="text-sm text-gray-500">
            {sortedProducts.length} of {products.length} products
          </div>
        </div>
        
        {/* Search and Filter Section */}
        <div className="card p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="input-group">
              <FaSearch className="input-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            {/* Category Filter */}
            <div className="input-group">
              <FaFilter className="input-icon" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input pl-10"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="books">Books</option>
                <option value="clothing">Clothing</option>
                <option value="sports">Sports</option>
                <option value="furniture">Furniture</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            {/* Price Range */}
            <div className="flex space-x-3">
              <input
                type="number"
                placeholder="Min ₹"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="input flex-1"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="input flex-1"
              />
            </div>
            
            {/* Sort */}
            <div className="input-group">
              <FaSort className="input-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input pl-10"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-20">
            <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Loading amazing products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedProducts.map(product => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onChat={handleChat} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}

        {sortedProducts.length === 0 && !loading && !error && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPriceRange({ min: '', max: '' });
              }} 
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* Chat Modal */}
      <ChatModal
        isOpen={chatModal.isOpen}
        onClose={closeChatModal}
        product={chatModal.product}
        currentUser={user}
        otherUser={chatModal.otherUser}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        product={editModal.product}
        onProductUpdated={handleProductUpdated}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        product={deleteModal.product}
        onProductDeleted={handleProductDeleted}
      />
    </div>
  );
};

export default Marketplace;
        