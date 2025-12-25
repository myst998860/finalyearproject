# Cloudinary Integration Setup Guide

This guide will help you set up Cloudinary for image storage in your BookBridge application.

## Prerequisites

1. Create a Cloudinary account at [https://cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from your Cloudinary dashboard

## Backend Setup

### 1. Update application.properties

Replace the placeholder values in `src/main/resources/application.properties`:

```properties
# Cloudinary Configuration
cloudinary.cloud.name=your_actual_cloud_name
cloudinary.api.key=your_actual_api_key
cloudinary.api.secret=your_actual_api_secret
cloudinary.url=cloudinary://your_api_key:your_api_secret@your_cloud_name
```

### 2. Install Dependencies

The Cloudinary dependencies have been added to `pom.xml`. Run:

```bash
mvn clean install
```

### 3. Files Created/Modified

- `src/main/java/com/bookbridge/config/CloudinaryConfig.java` - Cloudinary configuration
- `src/main/java/com/bookbridge/service/CloudinaryService.java` - Cloudinary service for uploads
- `src/main/java/com/bookbridge/service/FileStorageService.java` - Updated to use Cloudinary
- `src/main/java/com/bookbridge/controller/FileController.java` - Updated to handle Cloudinary URLs

## Frontend Setup

### 1. Install Dependencies

The Cloudinary dependencies have been installed. If you need to reinstall:

```bash
cd Frontend/Second-Hand-Buy-Sell-platform-For-Books
npm install cloudinary react-cloudinary
```

### 2. Update Cloudinary Configuration

Update `Frontend/Second-Hand-Buy-Sell-platform-For-Books/src/config/cloudinary.js`:

```javascript
const CLOUDINARY_CONFIG = {
  cloudName: 'your_actual_cloud_name', // Replace with your actual cloud name
  apiKey: 'your_actual_api_key', // Replace with your actual API key
  uploadPreset: 'bookbridge_uploads', // Optional: for direct uploads
};
```

### 3. Files Created

- `Frontend/Second-Hand-Buy-Sell-platform-For-Books/src/config/cloudinary.js` - Cloudinary configuration and helper functions
- `Frontend/Second-Hand-Buy-Sell-platform-For-Books/src/components/CloudinaryImage.js` - Reusable image component

## Usage Examples

### Backend - Uploading Images

The existing upload methods now use Cloudinary:

```java
// In your controllers, the existing methods will automatically use Cloudinary
String imageUrl = fileStorageService.storeBookImage(file);
String profileUrl = fileStorageService.storeProfileImage(file);
```

### Frontend - Displaying Images

#### Using the CloudinaryImage component:

```jsx
import CloudinaryImage from '../components/CloudinaryImage';

// Book image
<CloudinaryImage 
  src={book.bookImage} 
  alt={book.title}
  width={300}
  height={400}
  crop="fill"
  quality={85}
/>

// Profile image
<CloudinaryImage 
  src={user.profileImage} 
  alt={user.fullName}
  width={100}
  height={100}
  crop="fill"
  quality={80}
/>
```

#### Using helper functions:

```jsx
import { getBookImageUrl, getProfileImageUrl } from '../config/cloudinary';

// In your components
<img src={getBookImageUrl(book.bookImage, 300)} alt={book.title} />
<img src={getProfileImageUrl(user.profileImage, 100)} alt={user.fullName} />
```

#### Using the API helper:

```jsx
import { getImageUrl } from '../services/api';

// This will handle both Cloudinary URLs and local file URLs
<img src={getImageUrl(book.bookImage)} alt={book.title} />
```

## Image Transformations

Cloudinary automatically applies optimizations:

- **Auto format**: Automatically serves WebP to supported browsers
- **Auto quality**: Optimizes quality based on content
- **Responsive images**: Different sizes for different devices
- **Lazy loading**: Built-in lazy loading support

## Folder Structure in Cloudinary

Images are organized in the following folders:
- `bookbridge/profiles` - User profile images
- `bookbridge/id-cards` - ID card images
- `bookbridge/documents` - Organization documents
- `bookbridge/books` - Book images

## Migration from Local Storage

If you have existing images stored locally:

1. Upload them to Cloudinary using the Cloudinary dashboard or API
2. Update the database records with the new Cloudinary URLs
3. The application will automatically handle both old local URLs and new Cloudinary URLs

## Security Considerations

1. **API Key Security**: Never expose your Cloudinary API secret in frontend code
2. **Upload Presets**: Use signed upload presets for secure direct uploads
3. **Access Control**: Configure Cloudinary access control settings
4. **Rate Limiting**: Monitor API usage to stay within limits

## Troubleshooting

### Common Issues:

1. **Images not loading**: Check if Cloudinary URLs are correct
2. **Upload failures**: Verify API credentials and permissions
3. **CORS issues**: Configure CORS settings in Cloudinary dashboard
4. **Performance**: Use appropriate image transformations for your use case

### Debug Mode:

Enable debug logging in `application.properties`:

```properties
logging.level.com.cloudinary=DEBUG
```

## Benefits of Cloudinary Integration

1. **Automatic optimization**: Images are automatically optimized for web
2. **CDN delivery**: Fast global content delivery
3. **Responsive images**: Automatic responsive image generation
4. **Format optimization**: Automatic WebP/AVIF conversion
5. **Storage management**: No local storage management needed
6. **Scalability**: Handles high traffic and large file uploads

## Next Steps

1. Test the integration with your Cloudinary credentials
2. Update your frontend components to use the new CloudinaryImage component
3. Monitor image uploads and performance
4. Configure Cloudinary settings in your dashboard for optimal performance 