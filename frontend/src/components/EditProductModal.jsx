import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditProductModal = ({ isOpen, onClose, product, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    condition: 'good'
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        condition: product.condition || 'good'
      });
      // Set existing images from product
      const images = product.imageUrls || [product.imageUrl];
      setExistingImages(images.filter(img => img && img.trim() !== ''));
      setNewImages([]);
      setNewImagePreviews([]);
      setError('');
    }
  }, [product, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate number of files (max 5 total)
    if (existingImages.length + newImages.length + files.length > 5) {
      setError("You can upload a maximum of 5 images total");
      return;
    }

    // Validate each file
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image should be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError("Please select valid image files only");
        return;
      }
    }

    // Add new files
    const updatedNewImages = [...newImages, ...files];
    setNewImages(updatedNewImages);
    
    // Create previews for new files
    const newPreviews = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPreviews).then(previews => {
      setNewImagePreviews([...newImagePreviews, ...previews]);
    });

    setError("");
  };

  const removeExistingImage = (index) => {
    const updatedImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(updatedImages);
  };

  const removeNewImage = (index) => {
    const updatedImages = newImages.filter((_, i) => i !== index);
    const updatedPreviews = newImagePreviews.filter((_, i) => i !== index);
    setNewImages(updatedImages);
    setNewImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('condition', formData.condition);
      
      // Add existing images as JSON string
      formDataToSend.append('existingImages', JSON.stringify(existingImages));
      
      // Add new images
      newImages.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      const response = await axios.put(
        `http://localhost:5000/products/${product._id}`,
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        onProductUpdated(response.data.product);
        onClose();
      } else {
        setError(response.data.message || 'Failed to update product');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your product"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter price"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              <option value="electronics">Electronics</option>
              <option value="books">Books</option>
              <option value="clothing">Clothing</option>
              <option value="sports">Sports</option>
              <option value="furniture">Furniture</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Images ({existingImages.length + newImages.length}/5)
            </label>
            <div className="space-y-3">
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Existing Images:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {existingImages.map((image, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <img
                          src={image}
                          alt={`Existing image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {newImagePreviews.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">New Images:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {newImagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <img
                          src={preview}
                          alt={`New image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              {existingImages.length + newImages.length < 5 && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    multiple
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add {5 - (existingImages.length + newImages.length)} more image{(5 - (existingImages.length + newImages.length)) !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {existingImages.length + newImages.length === 5 && (
                <p className="text-xs text-gray-500">
                  Maximum 5 images reached
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal; 