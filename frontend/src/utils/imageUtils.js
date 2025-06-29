// Image utility functions for consistent fallback handling

export const getImageUrl = (imageUrl, fallbackType = 'product') => {
  if (!imageUrl) {
    switch (fallbackType) {
      case 'profile':
        return 'https://placehold.co/120x120?text=Profile';
      case 'avatar':
        return 'https://placehold.co/32x32?text=U';
      case 'product':
      default:
        return 'https://placehold.co/300x200?text=No+Image';
    }
  }
  return imageUrl;
};

export const handleImageError = (e, fallbackType = 'product') => {
  e.target.src = getImageUrl(null, fallbackType);
};

export const getProductImageUrl = (imageUrl) => getImageUrl(imageUrl, 'product');
export const getProfileImageUrl = (imageUrl) => getImageUrl(imageUrl, 'profile');
export const getAvatarImageUrl = (imageUrl) => getImageUrl(imageUrl, 'avatar'); 