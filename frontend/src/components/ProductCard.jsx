import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ImageGallery from './ImageGallery.jsx';

const ProductCard = ({ product, showDetails = true, onClick }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col gap-4 hover:scale-105 transition-transform duration-200 border border-white/10">
      <Link to={`/product/${product._id}`} className="block group">
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-100">
          <ImageGallery images={product.imageUrls || [product.imageUrl]} productName={product.name} compact={true} />
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-base font-bold shadow">
            ₹{product.price}
          </div>
          {product.avgRating && (
            <div className="absolute bottom-2 left-2 bg-white/90 rounded-full px-3 py-1 flex items-center gap-1 text-yellow-500 text-sm font-semibold shadow">
              {product.avgRating.toFixed(1)}
              <FaStar />
              <span className="text-gray-500 ml-1">({product.reviewCount})</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <Link to={`/product/${product._id}`} className="block">
          <h4 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition line-clamp-1">{product.name}</h4>
        </Link>
        <p className="text-gray-500 text-sm mb-2 line-clamp-2 flex-1">{product.description}</p>
        {product.seller && (
          <div className="flex items-center gap-2 mb-2">
            <img
              src={product.seller.profilePicture || 'https://placehold.co/32x32?text=U'}
              alt={product.seller.displayName || product.seller.name}
              className="w-8 h-8 rounded-full object-cover border border-blue-100"
            />
            <span className="text-sm text-blue-700 font-medium">{product.seller.displayName || product.seller.name}</span>
          </div>
        )}
        {showDetails && (
          <Link
            to={`/product/${product._id}`}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition shadow"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 