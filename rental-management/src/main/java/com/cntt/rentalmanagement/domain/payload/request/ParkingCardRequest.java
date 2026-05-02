package com.cntt.rentalmanagement.domain.payload.request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Getter
@Setter
public class ParkingCardRequest {
    private String licensePlate;   // Biển số xe
    private String brandModel;     // Dòng xe
    private String color;          // Màu xe
    private String vehicleType;    // Loại xe
    private Long packageId;        // ID của gói cước
    private MultipartFile registrationImage; // Ảnh giấy đăng ký xe
    private List<MultipartFile> vehicleImages; // Các ảnh chụp xe
}