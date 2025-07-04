import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ChatModal from "../components/ChatModal.jsx";
import ProfileDropdown from "../components/ProfileDropdown.jsx";
import EditProductModal from "../components/EditProductModal.jsx";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal.jsx";
import ImageGallery from "../components/ImageGallery.jsx";
import { FaStar } from 'react-icons/fa';
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {user ? `Welcome, ${user.displayName || user.name}!` : "Welcome to CampusKart"}
        </h2>
        <p className="text-gray-500 text-lg">
          Discover and trade items easily within your campus.
        </p>
        <Link to="/sell">
          <button className="mt-6 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition">
            Sell a Product
          </button>
        </Link>
      </section>

      {/* Product Listing */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h3 className="text-2xl font-semibold text-cyan-100 mb-6 drop-shadow">Latest Listings</h3>
        
        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {sortedProducts.length} of {products.length} products
            </p>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {sortedProducts.map(product => (
                <ProductCard key={product._id} product={product} onChat={handleChat} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
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
