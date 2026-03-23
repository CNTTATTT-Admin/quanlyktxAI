package com.cntt.rentalmanagement.domain.enums;

import lombok.Getter;

@Getter
public enum ParkingCardStatus {
    PENDING("PENDING"),                                     // Chờ phê duyệt
    APPROVED_WAITING_PAYMENT("APPROVED_WAITING_PAYMENT"),   // Đã duyệt, chờ thanh toán
    REJECTED("REJECTED"),                                   // Bị từ chối
    ACTIVE("ACTIVE"),                                       // Đang hoạt động
    EXPIRED("EXPIRED"),                                     // Đã hết hạn
    CANCELLED("CANCELLED");                                 // Đã hủy

    private final String value;

    ParkingCardStatus(String value){
        this.value = value;
    }
}