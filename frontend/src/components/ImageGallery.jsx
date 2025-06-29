import React, { useState } from 'react';

const ImageGallery = ({ images = [], productName = "Product", compact = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Ensure we have at least one image
  const displayImages = images && images.length > 0 ? images : ['https://placehold.co/300x200?text=No+Image'];

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  // Compact mode for product cards
  if (compact) {
    return (
      <div className="w-full h-full">
        <div className="w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            src={displayImages[currentImageIndex]}
            alt={`${productName} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div 
            className="hidden w-full h-full flex-col items-center justify-center text-gray-500 bg-gray-50"
          >
            <svg className="w-8 h-8 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs font-medium">No Image</p>
          </div>
        </div>
      </div>
    );
  }

  // Full mode for product detail page
  return (
    <div className="w-full">
      {/* Main Image */}
      <div className="relative group">
        <div className="w-full h-96 bg-gray-100 rounded-lg shadow-md flex items-center justify-center overflow-hidden">
          <img
            src={displayImages[currentImageIndex]}
            alt={`${productName} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div 
            className="hidden w-full h-full flex-col items-center justify-center text-gray-500 bg-gray-50"
          >
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">Image Not Available</p>
            <p className="text-xs text-gray-400 mt-1">{productName}</p>
          </div>
        </div>

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        {displayImages.length > 1 && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {currentImageIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {displayImages.length > 1 && (
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                index === currentImageIndex 
                  ? 'border-blue-500 shadow-md' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                className="hidden w-full h-full items-center justify-center bg-gray-100"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Single Image Placeholder */}
      {displayImages.length === 1 && (
        <div className="mt-4 flex space-x-2">
          <div className="w-16 h-16 bg-gray-200 rounded border-2 border-blue-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery; 