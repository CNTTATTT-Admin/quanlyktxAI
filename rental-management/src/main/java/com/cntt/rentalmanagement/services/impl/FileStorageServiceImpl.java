package com.cntt.rentalmanagement.services.impl;


import com.cntt.rentalmanagement.config.FileStorageProperties;
import com.cntt.rentalmanagement.exception.FileStorageException;
import com.cntt.rentalmanagement.exception.MyFileNotFoundException;
import com.cntt.rentalmanagement.services.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {
    private Path fileStorageLocation;

    public FileStorageServiceImpl() {
        // TODO document why this constructor is empty
    }

    @Autowired
    public void FileStorageService(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir())
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Invalid");
        }
    }

    @Override
    public String storeFile(MultipartFile file) {

        // Lấy tên file gốc
        String originalFileName = StringUtils.cleanPath(
                Objects.requireNonNull(file.getOriginalFilename()));

        try {

            // Check tên file hợp lệ
            if (originalFileName.contains("..")) {
                throw new FileStorageException("Invalid file name");
            }

            // Lấy extension của file (.png, .jpg,...)
            String extension = "";
            int index = originalFileName.lastIndexOf(".");
            if (index > 0) {
                extension = originalFileName.substring(index);
            }

            // Tạo tên file mới bằng UUID
            String newFileName = UUID.randomUUID().toString() + extension;

            // Tạo đường dẫn lưu file
            Path targetLocation = this.fileStorageLocation.resolve(newFileName);

            // Copy file vào thư mục
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return newFileName;

        } catch (IOException ex) {
            throw new FileStorageException("Could not store file");
        }
    }

    @Override
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if(resource.exists()) {
                return resource;
            } else {
                throw new MyFileNotFoundException("Not found!!!");
            }
        } catch (MalformedURLException ex) {
            throw new MyFileNotFoundException("Not found!!!");
        }
    }
}
