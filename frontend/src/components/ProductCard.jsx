import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ImageGallery from './ImageGallery.jsx';
import AddToCartButton from './AddToCartButton.jsx';
import { useCart } from '../contexts/CartContext.jsx';

const ProductCard = ({ product, showDetails = true, onClick }) => {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(product._id);

  return (
    <motion.div 
      className="card card-hover p-6 flex flex-col gap-4 group"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl">
          <ImageGallery images={product.imageUrls || [product.imageUrl]} productName={product.name} compact={true} />
          
          {/* Price Badge */}
          <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl text-lg font-bold shadow-lg">
            ₹{product.price}
          </div>
          
          {/* Rating Badge */}
          {product.avgRating && (
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 text-yellow-500 text-sm font-semibold shadow-lg">
              <FaStar className="text-yellow-500" />
              <span>{product.avgRating.toFixed(1)}</span>
              <span className="text-gray-500 ml-1">({product.reviewCount})</span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="flex flex-col flex-1">
        <Link to={`/product/${product._id}`} className="block flex-1">
          <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
            {product.name}
          </h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-1">
            {product.description}
          </p>
        </Link>
        
        {/* Seller Info */}
        {product.seller && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <img
              src={product.seller.profilePicture || 'https://placehold.co/32x32?text=U'}
              alt={product.seller.displayName || product.seller.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 shadow-soft"
              onError={(e) => {
                e.target.src = 'https://placehold.co/32x32?text=U';
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-700 line-clamp-1">
                {product.seller.displayName || product.seller.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Verified Seller</p>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        {showDetails && (
          <div className="flex gap-3 mt-auto">
            <Link
              to={`/product/${product._id}`}
              className="flex-1 btn btn-primary text-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </Link>
            <AddToCartButton 
              product={product}
              onAddToCart={addToCart}
              disabled={inCart}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard; 