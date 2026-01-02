//package com.bookbridge.service;
//
//import com.cloudinary.Cloudinary;
//import com.cloudinary.utils.ObjectUtils;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.util.Map;
//
//@Service
//public class CloudinaryService {
//
//    @Autowired
//    private Cloudinary cloudinary;
//
//    public String uploadImage(MultipartFile file, String folder) throws IOException {
//        try {
//            Map<String, Object> options = ObjectUtils.asMap(
//                "folder", folder,
//                "resource_type", "auto",
//                "transformation", "f_auto,q_auto"
//            );
//            
//            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);
//            return (String) result.get("secure_url");
//        } catch (IOException e) {
//            throw new IOException("Failed to upload image to Cloudinary", e);
//        }
//    }
//
//    public String uploadProfileImage(MultipartFile file) throws IOException {
//        return uploadImage(file, "bookbridge/profiles");
//    }
//
//    public String uploadIdCardImage(MultipartFile file) throws IOException {
//        return uploadImage(file, "bookbridge/id-cards");
//    }
//
//    public String uploadDocumentImage(MultipartFile file) throws IOException {
//        return uploadImage(file, "bookbridge/documents");
//    }
//
//    public String uploadBookImage(MultipartFile file) throws IOException {
//        return uploadImage(file, "bookbridge/books");
//    }
//
//    public boolean deleteImage(String publicId) {
//        try {
//            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
//            return "ok".equals(result.get("result"));
//        } catch (IOException e) {
//            return false;
//        }
//    }
//
//    public String getPublicIdFromUrl(String url) {
//        if (url == null || url.isEmpty()) {
//            return null;
//        }
//        
//        // Extract public ID from Cloudinary URL
//        // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image.jpg
//        String[] parts = url.split("/upload/");
//        if (parts.length > 1) {
//            String[] uploadParts = parts[1].split("/");
//            if (uploadParts.length > 1) {
//                // Remove version number if present
//                String[] versionParts = uploadParts[0].split("/");
//                if (versionParts.length > 1) {
//                    // Skip version and build public ID
//                    StringBuilder publicId = new StringBuilder();
//                    for (int i = 1; i < uploadParts.length; i++) {
//                        if (i > 1) publicId.append("/");
//                        publicId.append(uploadParts[i]);
//                    }
//                    // Remove file extension
//                    String result = publicId.toString();
//                    int dotIndex = result.lastIndexOf('.');
//                    return dotIndex > 0 ? result.substring(0, dotIndex) : result;
//                }
//            }
//        }
//        return null;
//    }
//    
//    
//    
//    
//} 

package com.bookbridge.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    // ✅ ADD THIS METHOD - Generic file upload (auto-detects type)
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        try {
            Map<String, Object> options = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "auto", // Auto-detect file type
                "transformation", "f_auto,q_auto"
            );
            
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new IOException("Failed to upload file to Cloudinary", e);
        }
    }

    // ✅ ADD THIS METHOD - Upload specifically for tutorials
    public String uploadTutorialFile(MultipartFile file, Long tutorialId) throws IOException {
        String folder = "bookbridge/tutorials/" + tutorialId + "/files";
        return uploadFile(file, folder);
    }

    // ✅ ADD THIS METHOD - Upload tutorial thumbnail
    public String uploadTutorialThumbnail(MultipartFile file, Long tutorialId) throws IOException {
        String folder = "bookbridge/tutorials/" + tutorialId + "/thumbnails";
        return uploadFile(file, folder);
    }

    // ✅ ADD THIS METHOD - Upload video specifically
    public String uploadVideo(MultipartFile file, String folder) throws IOException {
        try {
            Map<String, Object> options = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "video",
                "transformation", "f_auto,q_auto"
            );
            
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new IOException("Failed to upload video to Cloudinary", e);
        }
    }

    // ✅ ADD THIS METHOD - Upload document (PDF, DOC, etc.)
    public String uploadDocument(MultipartFile file, String folder) throws IOException {
        try {
            Map<String, Object> options = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "raw", // Use 'raw' for documents
                "transformation", "f_auto,q_auto"
            );
            
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new IOException("Failed to upload document to Cloudinary", e);
        }
    }

    // ✅ ADD THIS METHOD - Batch upload multiple files
    public Map<?, ?>[] uploadMultipleFiles(MultipartFile[] files, String folder) throws IOException {
        try {
            Map<?, ?>[] results = new Map[files.length];
            for (int i = 0; i < files.length; i++) {
                Map<String, Object> options = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "auto"
                );
                results[i] = cloudinary.uploader().upload(files[i].getBytes(), options);
            }
            return results;
        } catch (IOException e) {
            throw new IOException("Failed to upload multiple files to Cloudinary", e);
        }
    }

    // Your existing methods remain unchanged
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        try {
            Map<String, Object> options = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "auto",
                "transformation", "f_auto,q_auto"
            );
            
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new IOException("Failed to upload image to Cloudinary", e);
        }
    }

    public String uploadProfileImage(MultipartFile file) throws IOException {
        return uploadImage(file, "bookbridge/profiles");
    }

    public String uploadIdCardImage(MultipartFile file) throws IOException {
        return uploadImage(file, "bookbridge/id-cards");
    }

    public String uploadDocumentImage(MultipartFile file) throws IOException {
        return uploadImage(file, "bookbridge/documents");
    }

    public String uploadBookImage(MultipartFile file) throws IOException {
        return uploadImage(file, "bookbridge/books");
    }

    public boolean deleteImage(String publicId) {
        try {
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            return "ok".equals(result.get("result"));
        } catch (IOException e) {
            return false;
        }
    }

    public String getPublicIdFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        
        // Extract public ID from Cloudinary URL
        // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image.jpg
        String[] parts = url.split("/upload/");
        if (parts.length > 1) {
            String[] uploadParts = parts[1].split("/");
            if (uploadParts.length > 1) {
                // Remove version number if present
                String[] versionParts = uploadParts[0].split("/");
                if (versionParts.length > 1) {
                    // Skip version and build public ID
                    StringBuilder publicId = new StringBuilder();
                    for (int i = 1; i < uploadParts.length; i++) {
                        if (i > 1) publicId.append("/");
                        publicId.append(uploadParts[i]);
                    }
                    // Remove file extension
                    String result = publicId.toString();
                    int dotIndex = result.lastIndexOf('.');
                    return dotIndex > 0 ? result.substring(0, dotIndex) : result;
                }
            }
        }
        return null;
    }
}

