package com.cntt.rentalmanagement.domain.enums;

import lombok.Getter;

@Getter
public enum VehicleType {
    CAR("CAR"),             // Ô tô
    MOTORBIKE("MOTORBIKE"); // Xe máy

    private final String value;

    VehicleType(String value){
        this.value = value;
    }
}