import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import ProfileDropdown from "../components/ProfileDropdown.jsx";
import ImageGallery from "../components/ImageGallery.jsx";
import RelistProductModal from "../components/RelistProductModal.jsx";

const Profile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [relistModal, setRelistModal] = useState({ isOpen: false, product: null });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editForm, setEditForm] = useState({
    displayName: "",
    phoneNumber: "",
    campus: "",
    bio: ""
  });

  const isOwnProfile = !userId || (currentUser && currentUser._id === userId);

  // Fetch current user
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/auth/login/success`, { withCredentials: true })
      .then((res) => setCurrentUser(res.data.user))
      .catch((err) => console.log("Not logged in", err));
  }, []);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const endpoint = userId 
          ? `${import.meta.env.VITE_API_URL}/profile/${userId}`
          : `${import.meta.env.VITE_API_URL}/profile/me`;
        
        const response = await axios.get(endpoint, { withCredentials: true });
        
        if (response.data.success) {
          setUser(response.data.user);
          setEditForm({
            displayName: response.data.user.displayName || "",
            phoneNumber: response.data.user.phoneNumber || "",
            campus: response.data.user.campus || "",
            bio: response.data.user.bio || ""
          });
        } else {
          setError("Failed to fetch profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Fetch user's products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const endpoint = userId 
          ? `${import.meta.env.VITE_API_URL}/profile/${userId}/products`
          : `${import.meta.env.VITE_API_URL}/profile/me/products`;
        
        const response = await axios.get(endpoint, { withCredentials: true });
        
        if (response.data.success) {
          setProducts(response.data.products);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    if (user) {
      fetchProducts();
    }
  }, [user, userId]);

  const handleRelistSuccess = () => {
    // Refresh the products list
    const fetchProducts = async () => {
      try {
        const endpoint = userId 
          ? `${import.meta.env.VITE_API_URL}/profile/${userId}/products`
          : `${import.meta.env.VITE_API_URL}/profile/me/products`;
        
        const response = await axios.get(endpoint, { withCredentials: true });
        
        if (response.data.success) {
          setProducts(response.data.products);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
    
    // Show success message
    setSuccessMessage("Product re-listed successfully! 🎉");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/profile/me`,
        editForm,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setUser(response.data.user);
        setIsEditing(false);
        setShowSuccess(true);
        setSuccessMessage("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link to="/landing" className="text-blue-600 hover:text-blue-800">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={user.profilePicture || "https://placehold.co/120x120?text=Profile"}
                  alt={user.displayName || user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {user.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {user.displayName || user.name}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                {user.campus && (
                  <p className="text-sm text-gray-700 mt-1">
                    📍 {user.campus}
                  </p>
                )}
                <p className="text-sm text-gray-700">
                  Member since {formatDate(user.joinDate)}
                </p>
              </div>
            </div>
            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
              <p className="text-gray-600">{user.bio}</p>
            </div>
          )}
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Profile</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={editForm.displayName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Enter your display name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={editForm.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campus
                </label>
                <input
                  type="text"
                  name="campus"
                  value={editForm.campus}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Enter your campus"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* User's Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {isOwnProfile ? "My Products" : `${user.displayName || user.name}'s Products`}
          </h2>
          
          {/* Debug Information */}
          {isOwnProfile && (
            <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
              <p>Debug Info:</p>
              <p>Total products: {products.length}</p>
              <p>Available products: {products.filter(p => p.isAvailable && p.quantity > 0).length}</p>
              <p>Sold out products: {products.filter(p => !p.isAvailable || p.quantity === 0).length}</p>
              <p>Products with quantity 0: {products.filter(p => p.quantity === 0).length}</p>
              <p>Products with isAvailable false: {products.filter(p => !p.isAvailable).length}</p>
              {products.length > 0 && (
                <div className="mt-2">
                  <p>Product details:</p>
                  {products.map(p => (
                    <div key={p._id} className="ml-2">
                      {p.name}: qty={p.quantity}, available={p.isAvailable ? 'true' : 'false'}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Test Button - Remove this after testing */}
              {products.filter(p => p.isAvailable && p.quantity > 0).length > 0 && (
                <div className="mt-3">
                  <button
                    onClick={async () => {
                      const availableProduct = products.find(p => p.isAvailable && p.quantity > 0);
                      if (availableProduct) {
                        try {
                          // Manually set it as sold out for testing
                          await axios.put(
                            `${import.meta.env.VITE_API_URL}/products/${availableProduct._id}/test-sold-out`,
                            {},
                            { withCredentials: true }
                          );
                          
                          alert('Product marked as sold out for testing!');
                          window.location.reload();
                        } catch (err) {
                          console.error('Error:', err);
                          alert('Error: ' + err.message);
                        }
                      }
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                  >
                    Test: Mark First Available Product as Sold Out
                  </button>
                </div>
              )}
            </div>
          )}
          
          {products.length > 0 ? (
            <div>
              {/* Available Products */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Available Products
                    </h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {products.filter(p => p.isAvailable && p.quantity > 0).length} items
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    These products are visible to buyers
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products
                    .filter(product => product.isAvailable && product.quantity > 0)
                    .map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                    >
                      <div className="relative h-48">
                        <ImageGallery 
                          images={product.imageUrls || [product.imageUrl]} 
                          productName={product.name}
                          compact={true}
                        />
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          ₹{product.price}
                        </div>
                        <div className="absolute bottom-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          Qty: {product.quantity}
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                          <span className="text-green-600 font-bold text-lg ml-2">
                            ₹{product.price}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-700">Listed:</span>
                            <span className="text-xs text-gray-700 font-medium">
                              {formatDate(product.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-700">Condition:</span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {product.condition || 'Good'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sold Out Products (only show to owner) */}
              {isOwnProfile && products.filter(p => !p.isAvailable || p.quantity === 0).length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Sold Out Products
                      </h3>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        {products.filter(p => !p.isAvailable || p.quantity === 0).length} items
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      These products are no longer visible to buyers
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="text-red-600 text-xl">🛑</div>
                      <div>
                        <h4 className="font-semibold text-red-800">Products Need Attention</h4>
                        <p className="text-red-700 text-sm mt-1">
                          Your sold-out products are hidden from the marketplace. Re-list them to start selling again!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products
                      .filter(product => !product.isAvailable || product.quantity === 0)
                      .map((product) => (
                      <div
                        key={product._id}
                        className="bg-white rounded-lg overflow-hidden border-2 border-red-200 hover:border-red-300 transition-all duration-200 hover:shadow-lg"
                      >
                        <div className="relative h-48">
                          <ImageGallery 
                            images={product.imageUrls || [product.imageUrl]} 
                            productName={product.name}
                            compact={true}
                          />
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            SOLD OUT
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                        
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
                              {product.name}
                            </h3>
                            <span className="text-green-600 font-bold text-lg ml-2">
                              ₹{product.price}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {product.description}
                          </p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-700">Listed:</span>
                              <span className="text-xs text-gray-700 font-medium">
                                {formatDate(product.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-700">Condition:</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {product.condition || 'Good'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <button
                              onClick={() => setRelistModal({ isOpen: true, product })}
                              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-semibold shadow-sm hover:shadow-md"
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <span>🔄</span>
                                <span>Re-list Product</span>
                              </div>
                            </button>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  // Quick re-list with quantity 1
                                  setRelistModal({ isOpen: true, product });
                                }}
                                className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded text-sm hover:bg-blue-100 transition-colors font-medium"
                              >
                                Quick Re-list
                              </button>
                              <button
                                onClick={() => {
                                  // Advanced re-list
                                  setRelistModal({ isOpen: true, product });
                                }}
                                className="flex-1 bg-purple-50 text-purple-600 py-2 px-3 rounded text-sm hover:bg-purple-100 transition-colors font-medium"
                              >
                                Edit & Re-list
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                      💡 <strong>Tip:</strong> Use "Quick Re-list" to get back online fast, or "Edit & Re-list" to update details
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-700 text-6xl mb-4">📦</div>
              <p className="text-gray-700 text-lg mb-4">
                {isOwnProfile ? "You haven't listed any products yet." : "No products listed yet."}
              </p>
              {isOwnProfile && (
                <Link to="/sell">
                  <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition">
                    List Your First Product
                  </button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Relist Product Modal */}
      {relistModal.isOpen && (
        <RelistProductModal
          isOpen={relistModal.isOpen}
          onClose={() => setRelistModal({ isOpen: false, product: null })}
          product={relistModal.product}
          onSuccess={handleRelistSuccess}
        />
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-slide-in">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold">Success!</p>
              <p className="text-sm">{successMessage}</p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 