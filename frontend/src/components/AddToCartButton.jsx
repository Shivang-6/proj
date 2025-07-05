import React, { useState } from 'react';

const AddToCartButton = ({ product, onAddToCart, disabled = false }) => {
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (disabled || loading) return;
    
    setLoading(true);
    try {
      await onAddToCart(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || loading}
      className={`btn ${
        disabled || loading
          ? 'btn-secondary opacity-50 cursor-not-allowed'
          : 'btn-success group'
      }`}
    >
      {loading ? (
        <>
          <div className="loading-spinner"></div>
          <span>Adding...</span>
        </>
      ) : disabled ? (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>In Cart</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
          <span>Add to Cart</span>
        </>
      )}
    </button>
  );
};

export default AddToCartButton; 