package com.bookbridge.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.io.File;

@Configuration
public class FileStorageConfig implements CommandLineRunner, WebMvcConfigurer {

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    @Override
    public void run(String... args) throws Exception {
        createDirectory(uploadDir);
        createDirectory(uploadDir + "/profiles");
        createDirectory(uploadDir + "/id-cards");
        createDirectory(uploadDir + "/documents");
        createDirectory(uploadDir + "/books");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }

    private void createDirectory(String directoryPath) {
        File directory = new File(directoryPath);
        if (!directory.exists()) {
            directory.mkdirs();
        }
    }
}