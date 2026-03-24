package com.cntt.rentalmanagement.domain.payload.response;

import com.cntt.rentalmanagement.domain.enums.ParkingCardStatus;
import com.cntt.rentalmanagement.domain.enums.VehicleType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ParkingCardResponse {
    private Long id;
    private String licensePlate;
    private String brandModel;
    private String color;
    private VehicleType vehicleType;
    private String registrationImageUrl;
    private ParkingCardStatus status;
    private String rejectedReason;
    private LocalDateTime issueDate;
    private LocalDateTime expiryDate;
    private String invoiceStatus;
    
    private UserResponse user; 
    
    private ParkingPackageInfo packageInfo;

    @Getter
    @Setter
    @Builder
    public static class ParkingPackageInfo {
        private Long id;
        private String name;
        private java.math.BigDecimal price;
    }
}