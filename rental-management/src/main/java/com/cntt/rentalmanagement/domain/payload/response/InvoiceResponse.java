package com.cntt.rentalmanagement.domain.payload.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class InvoiceResponse {
    private Long id;
    private BigDecimal amount;
    private String status;
    private String paymentMethod;
    private String transactionId;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;

    private UserInfo user;
    private ParkingCardInfo parkingCard;

    @Getter
    @Setter
    @Builder
    public static class UserInfo {
        private Long id;
        private String name;
        private String phone;
    }

    @Getter
    @Setter
    @Builder
    public static class ParkingCardInfo {
        private Long id;
        private String licensePlate;
        private PackageInfo packageInfo;
    }

    @Getter
    @Setter
    @Builder
    public static class PackageInfo {
        private Long id;
        private String name;
    }
}