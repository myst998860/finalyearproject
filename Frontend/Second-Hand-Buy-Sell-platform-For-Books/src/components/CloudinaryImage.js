import React, { useState } from 'react';
import { getCloudinaryUrl } from '../config/cloudinary';

const CloudinaryImage = ({ 
  src, 
  alt = '', 
  width, 
  height, 
  crop = 'fill', 
  quality = 80, 
  className = '', 
  style = {},
  fallbackSrc = '/placeholder-image.jpg',
  onClick,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Get optimized Cloudinary URL
  const optimizedSrc = getCloudinaryUrl(src, {
    width,
    height,
    crop,
    quality
  });

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const imageSrc = imageError ? fallbackSrc : optimizedSrc;

  return (
    <div 
      className={`cloudinary-image-container ${className}`}
      style={{ 
        position: 'relative',
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto',
        ...style 
      }}
      onClick={onClick}
    >
      {imageLoading && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}
        >
          <div>Loading...</div>
        </div>
      )}
      
      <img
        src={imageSrc}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: crop === 'fill' ? 'cover' : 'contain',
          display: imageLoading ? 'none' : 'block'
        }}
        {...props}
      />
    </div>
  );
};

export default CloudinaryImage; 