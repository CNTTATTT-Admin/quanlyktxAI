package com.cntt.rentalmanagement.domain.enums;

import lombok.Getter;

@Getter
public enum InvoiceStatus {
    PENDING("PENDING"),       // Đang chờ thanh toán
    PAID("PAID"),             // Đã thanh toán thành công
    FAILED("FAILED"),         // Thanh toán thất bại
    CANCELLED("CANCELLED");   // Đã hủy hóa đơn

    private final String value;

    InvoiceStatus(String value){
        this.value = value;
    }
}