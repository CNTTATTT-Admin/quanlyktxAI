package com.cntt.rentalmanagement.domain.payload.response;

import com.cntt.rentalmanagement.domain.enums.ParkingCardStatus;
import com.cntt.rentalmanagement.domain.enums.VehicleType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
    private List<String> vehicleImages;
    private ParkingCardStatus status;
    private String rejectedReason;
    private LocalDateTime issueDate;
    private LocalDateTime expiryDate;
    private String invoiceStatus;

    private InvoiceDetail invoice;

    @Getter
    @Setter
    @Builder
    public static class InvoiceDetail {
        private Long id;
        private BigDecimal amount;
        private String status;
        private String paymentMethod;
        private String transactionId;
        private LocalDateTime paidAt;
    }
    
    private UserResponse user; 
    
    private ParkingPackageInfo packageInfo;

    @Getter
    @Setter
    @Builder
    public static class ParkingPackageInfo {
        private Long id;
        private String name;
        private BigDecimal price;
    }
}