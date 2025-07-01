import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ChatModal from "../components/ChatModal.jsx";
import ProfileDropdown from "../components/ProfileDropdown.jsx";
import EditProductModal from "../components/EditProductModal.jsx";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal.jsx";
import ImageGallery from "../components/ImageGallery.jsx";

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
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
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
      {/* Navbar */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">CampusKart</h1>
          <nav className="flex gap-4 items-center">
            <Link
              to="/sell"
              className="text-green-600 hover:text-green-800 font-medium transition"
            >
              Sell Product
            </Link>
            {user ? (
              <ProfileDropdown user={user} />
            ) : (
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 font-medium transition"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

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
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Latest Listings</h3>
        
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                >
                  <Link to={`/product/${product._id}`} className="block">
                    <div className="relative h-48 overflow-hidden">
                      <ImageGallery 
                        images={product.imageUrls || [product.imageUrl]} 
                        productName={product.name}
                        compact={true}
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium z-10">
                        ₹{product.price}
                      </div>
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${product._id}`} className="block">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 transition">{product.name}</h4>
                    </Link>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{product.description}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-green-600 font-bold text-lg">₹{product.price}</span>
                      <span className="text-gray-400 text-xs">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Seller Info */}
                    {product.seller && (
                      <div className="mb-3 p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500 mb-1">Seller</p>
                        <Link 
                          to={`/profile/${product.seller._id}`}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {product.seller.displayName || product.seller.name}
                        </Link>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        to={`/product/${product._id}`}
                        className="flex-1 bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600 transition flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </Link>
                      {isProductOwner(product) && (
                        <>
                          <button
                            onClick={() => handleEdit(product)}
                            className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded text-sm hover:bg-yellow-600 transition flex items-center justify-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition flex items-center justify-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleChat(product)}
                        className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <p className="text-gray-500 text-lg mb-4">No products available yet.</p>
                <p className="text-gray-400">Be the first to list something!</p>
                <Link to="/sell">
                  <button className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition">
                    Sell Your First Product
                  </button>
                </Link>
              </div>
            )}
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

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400">
        © {new Date().getFullYear()} CampusKart. All rights reserved.
      </footer>
    </div>
  );
};

export default Marketplace;
