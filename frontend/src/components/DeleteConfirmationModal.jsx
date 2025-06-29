import React, { useState } from 'react';
import axios from 'axios';

const DeleteConfirmationModal = ({ isOpen, onClose, product, onProductDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.delete(
        `http://localhost:5000/products/${product._id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        onProductDeleted(product._id);
        onClose();
      } else {
        setError(response.data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Delete Product</h3>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-4">
            Are you sure you want to delete <strong>"{product?.name}"</strong>? This action cannot be undone.
          </p>
          
          {product?.imageUrl && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-12 h-12 object-cover rounded"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/48x48?text=No+Image';
                }}
              />
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">₹{product.price}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 