import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WishlistButton = ({ product, user, onWishlistChange }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && product) {
      checkWishlistStatus();
    }
  }, [user, product]);

  const checkWishlistStatus = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/wishlist/check/${product._id}`, { withCredentials: true });
      setIsInWishlist(response.data.isInWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      alert('Please login to add items to your wishlist');
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        await axios.delete(`${import.meta.env.VITE_API_URL}/wishlist/${product._id}`, { withCredentials: true });
        setIsInWishlist(false);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/wishlist/${product._id}`, {}, { withCredentials: true });
        setIsInWishlist(true);
      }
      
      if (onWishlistChange) {
        onWishlistChange();
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`p-2 rounded-full transition-all duration-200 ${
        isInWishlist
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <svg
          className="w-5 h-5"
          fill={isInWishlist ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  );
};

export default WishlistButton; 