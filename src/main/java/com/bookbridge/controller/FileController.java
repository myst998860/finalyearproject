package com.bookbridge.controller;

import com.bookbridge.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/api/files/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        return serveFile(fileName);
    }
    
    @GetMapping("/books/{fileName:.+}")
    public ResponseEntity<Resource> downloadBookImage(@PathVariable String fileName) {
        System.out.println("FileController: Serving book image: " + fileName);
        // Add the books/ prefix if it's not already there
        String fullPath = fileName.startsWith("books/") ? fileName : "books/" + fileName;
        return serveFile(fullPath);
    }
    
    private ResponseEntity<Resource> serveFile(String fileName) {
        try {
            System.out.println("FileController: Processing file: " + fileName);
            
            // Check if this is a Cloudinary URL (starts with http)
            if (fileName.startsWith("http")) {
                System.out.println("FileController: Cloudinary URL detected, redirecting");
                // For Cloudinary URLs, redirect to the actual URL
                return ResponseEntity.status(302)
                        .header(HttpHeaders.LOCATION, fileName)
                        .build();
            }
            
            // Handle local files
            Path filePath = fileStorageService.getFilePath(fileName);
            System.out.println("FileController: File path: " + filePath);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                System.out.println("FileController: File found, content type: " + contentType);
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                System.out.println("FileController: File not found or not readable");
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            System.out.println("FileController: IOException: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
