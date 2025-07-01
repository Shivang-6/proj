// src/pages/Sell.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import ProfileDropdown from "../components/ProfileDropdown.jsx";

const Sell = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "1",
    category: "",
    condition: "good",
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formProgress, setFormProgress] = useState(0);
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/auth/login/success`, { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch((err) => {
        console.log("Not logged in", err);
        navigate("/login");
      });
  }, [navigate]);

  // Calculate form progress
  useEffect(() => {
    const filledFields = Object.values(formData).filter(value => 
      value !== "" && value !== null && (Array.isArray(value) ? value.length > 0 : true)
    ).length;
    setFormProgress((filledFields / Object.keys(formData).length) * 100);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(""); // Clear error when user starts typing
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate number of files (max 5)
    if (formData.images.length + files.length > 5) {
      setError("You can upload a maximum of 5 images");
      return;
    }

    // Validate each file
    for (const file of files) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select valid image files only");
        return;
      }
    }

    // Add new files to existing images
    const newImages = [...formData.images, ...files];
    setFormData({ ...formData, images: newImages });
    
    // Create previews for new files
    const newPreviews = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPreviews).then(previews => {
      setImagePreviews([...imagePreviews, ...previews]);
    });

    setError("");
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Product name is required");
      return false;
    }
    if (formData.name.length < 3) {
      setError("Product name should be at least 3 characters long");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Product description is required");
      return false;
    }
    if (formData.description.length < 10) {
      setError("Description should be at least 10 characters long");
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      setError("Please enter a valid price");
      return false;
    }
    if (!formData.quantity || formData.quantity < 1) {
      setError("Quantity must be at least 1");
      return false;
    }
    if (!formData.category) {
      setError("Please select a category");
      return false;
    }
    if (formData.images.length === 0) {
      setError("Please upload at least one product image");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('quantity', formData.quantity);
    data.append('category', formData.category);
    data.append('condition', formData.condition);
    
    // Append all images
    formData.images.forEach((image, index) => {
      data.append('images', image);
    });

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/products/add`, data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setSuccess("Product added successfully! Redirecting to marketplace...");
        // Reset form
        setFormData({
          name: "",
          description: "",
          price: "",
          quantity: "1",
          category: "",
          condition: "good",
          images: [],
        });
        setImagePreviews([]);
        // Redirect to marketplace after 2 seconds
        setTimeout(() => {
          navigate("/landing");
        }, 2000);
      } else {
        setError(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      if (error.response) {
        setError(error.response.data.message || "Upload failed");
      } else if (error.request) {
        setError("Network error - please check your connection");
      } else {
        setError("Upload failed - please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "electronics", label: "Electronics", icon: "📱" },
    { value: "books", label: "Books", icon: "📚" },
    { value: "clothing", label: "Clothing", icon: "👕" },
    { value: "sports", label: "Sports", icon: "⚽" },
    { value: "furniture", label: "Furniture", icon: "🪑" },
    { value: "other", label: "Other", icon: "📦" }
  ];

  const conditions = [
    { value: "new", label: "New", description: "Brand new, never used" },
    { value: "like-new", label: "Like New", description: "Used very little, looks new" },
    { value: "good", label: "Good", description: "Used but in good condition" },
    { value: "fair", label: "Fair", description: "Used with some wear" },
    { value: "poor", label: "Poor", description: "Heavily used, significant wear" }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">Sell Your Product</h1>
            <p className="text-blue-100">
              Reach thousands of students on campus. Create an attractive listing to sell faster!
            </p>
          </div>

          {/* Progress Bar */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Form Progress</span>
              <span className="text-sm text-gray-500">{Math.round(formProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., iPhone 12, Calculus Textbook, Nike Sneakers"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={handleChange}
                  value={formData.name}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Be specific and descriptive. Include brand names and model numbers.
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <label
                      key={category.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.category === category.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={category.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="text-2xl mr-3">{category.icon}</span>
                      <span className="font-medium">{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                <div className="space-y-2">
                  {conditions.map((condition) => (
                    <label
                      key={condition.value}
                      className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.condition === condition.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="condition"
                        value={condition.value}
                        onChange={handleChange}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium">{condition.label}</div>
                        <div className="text-sm text-gray-500">{condition.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="price"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={handleChange}
                    value={formData.price}
                    required
                  />
                </div>
                <div className="mt-1 flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Set a competitive price. Research similar items on campus.
                  </p>
                  {formData.price && (
                    <div className="text-sm text-green-600 font-medium">
                      You'll receive: ₹{Math.round(formData.price * 0.95)} (after 5% platform fee)
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="1"
                  min="1"
                  step="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={handleChange}
                  value={formData.quantity}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  placeholder="Describe your product in detail. Include specifications, features, why you're selling, and any defects..."
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={handleChange}
                  value={formData.description}
                  required
                />
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-gray-500">
                    {formData.description.length}/500 characters
                  </span>
                  <span className={`${
                    formData.description.length < 10 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {formData.description.length < 10 ? 'Too short' : 'Good length'}
                  </span>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images * ({imagePreviews.length}/5)
                </label>
                <div className="space-y-4">
                  {imagePreviews.length < 5 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        name="images"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                        multiple
                        required
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="text-gray-400 mb-2">
                          <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">Click to upload</span> or drag and drop
                        </div>
                        <div className="text-gray-500 text-sm">PNG, JPG, GIF up to 5MB each</div>
                        <div className="text-gray-400 text-xs mt-1">
                          {imagePreviews.length === 0 ? 'Upload at least 1 image' : `Add ${5 - imagePreviews.length} more image${5 - imagePreviews.length !== 1 ? 's' : ''}`}
                        </div>
                      </label>
                    </div>
                  )}

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border shadow-sm"
                          />
                          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                            Image {index + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Upload up to 5 clear, well-lit photos. Show the product from multiple angles for better sales.
                </p>
              </div>

              {/* Tips Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">💡 Selling Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Take photos in good lighting to show product details</li>
                  <li>• Be honest about the condition and any defects</li>
                  <li>• Set a competitive price by checking similar listings</li>
                  <li>• Respond quickly to buyer inquiries</li>
                  <li>• Meet in safe, public locations on campus</li>
                </ul>
              </div>

              {/* Pricing Guide */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">💰 Pricing Guide</h3>
                <div className="text-sm text-green-700 space-y-2">
                  <div className="flex justify-between">
                    <span>New items:</span>
                    <span>80-90% of retail price</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Like new:</span>
                    <span>70-80% of retail price</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Good condition:</span>
                    <span>50-70% of retail price</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fair condition:</span>
                    <span>30-50% of retail price</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Poor condition:</span>
                    <span>10-30% of retail price</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || formProgress < 80}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                  loading || formProgress < 80
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Uploading Product...
                  </div>
                ) : (
                  `List Product for ₹${formData.price || '0'}`
                )}
              </button>

              {formProgress < 80 && (
                <p className="text-center text-sm text-gray-500">
                  Please complete all required fields to list your product
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sell;
