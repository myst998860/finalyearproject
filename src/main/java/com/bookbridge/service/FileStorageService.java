package com.bookbridge.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Autowired
    private CloudinaryService cloudinaryService;

    @Value("${app.file.upload-dir}")
    private String uploadDir;
    
    @Value("${app.base.url}")
    private String baseUrl;

    public String storeFile(MultipartFile file, String subDirectory) throws IOException {
        // Normalize file name
        String originalFileName = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);
        String fileName = UUID.randomUUID().toString() + fileExtension;
        
        // Create directory if it doesn't exist
        Path targetLocation = Paths.get(uploadDir + "/" + subDirectory).toAbsolutePath().normalize();
        Files.createDirectories(targetLocation);
        
        // Copy file to the target location
        Path targetPath = targetLocation.resolve(fileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        
        return subDirectory + "/" + fileName;
    }

    public String storeProfileImage(MultipartFile file) throws IOException {
        return cloudinaryService.uploadProfileImage(file);
    }

    public String storeIdCardImage(MultipartFile file) throws IOException {
        return cloudinaryService.uploadIdCardImage(file);
    }

    public String storeDocumentImage(MultipartFile file) throws IOException {
        return cloudinaryService.uploadDocumentImage(file);
    }

    public String storeBookImage(MultipartFile file) throws IOException {
        return cloudinaryService.uploadBookImage(file);
    }

    public Path getFilePath(String fileName) {
        return Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
    }

    public boolean deleteFile(String fileName) {
        // If fileName is a Cloudinary URL, extract public ID and delete from Cloudinary
        if (fileName != null && fileName.startsWith("http")) {
            String publicId = cloudinaryService.getPublicIdFromUrl(fileName);
            if (publicId != null) {
                return cloudinaryService.deleteImage(publicId);
            }
        }
        
        // Fallback to local file deletion
        try {
            Path filePath = getFilePath(fileName);
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            return false;
        }
    }

    public String getFileUrl(String fileName) {
        // If fileName is already a Cloudinary URL, return it as is
        if (fileName != null && fileName.startsWith("http")) {
            return fileName;
        }
        // Fallback to local file URL
        return baseUrl + "/api/files/" + fileName;
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) {
            return "";
        }
        int dotIndex = fileName.lastIndexOf('.');
        return (dotIndex == -1) ? "" : fileName.substring(dotIndex);
    }
    
    public String storeVideo(MultipartFile video) throws IOException {
        // Save in a separate folder "videos" (optional)
        return storeFile(video, "videos");
    }

    public String storeImage(MultipartFile image) throws IOException {
        // Save in a separate folder "images" (optional)
        return storeFile(image, "images");
    }
    
}
