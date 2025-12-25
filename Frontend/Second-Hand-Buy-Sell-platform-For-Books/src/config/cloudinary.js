// Cloudinary configuration for frontend
const CLOUDINARY_CONFIG = {
  cloudName: 'your_cloud_name', // Replace with your actual cloud name
  apiKey: 'your_api_key', // Replace with your actual API key
  uploadPreset: 'bookbridge_uploads', // Optional: for direct uploads
};

// Helper function to get optimized image URL
export const getCloudinaryUrl = (imageUrl, options = {}) => {
  if (!imageUrl) return null;
  
  // If it's already a Cloudinary URL, apply transformations
  if (imageUrl.includes('cloudinary.com')) {
    const baseUrl = imageUrl.split('/upload/')[0] + '/upload/';
    const imagePath = imageUrl.split('/upload/')[1];
    
    // Apply transformations
    const transformations = [];
    
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    
    // Add auto format and quality optimization
    transformations.push('f_auto,q_auto');
    
    const transformString = transformations.join(',');
    
    return `${baseUrl}${transformString}/${imagePath}`;
  }
  
  // If it's a local file URL, return as is
  return imageUrl;
};

// Helper function to get thumbnail URL
export const getThumbnailUrl = (imageUrl, size = 150) => {
  return getCloudinaryUrl(imageUrl, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 80
  });
};

// Helper function to get optimized book image URL
export const getBookImageUrl = (imageUrl, size = 300) => {
  return getCloudinaryUrl(imageUrl, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 85
  });
};

// Helper function to get profile image URL
export const getProfileImageUrl = (imageUrl, size = 100) => {
  return getCloudinaryUrl(imageUrl, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 80
  });
};

// Helper function to get document image URL
export const getDocumentImageUrl = (imageUrl, size = 800) => {
  return getCloudinaryUrl(imageUrl, {
    width: size,
    quality: 90
  });
};

export default CLOUDINARY_CONFIG; 