package com.cntt.rentalmanagement.domain.enums;

import lombok.Getter;

@Getter
public enum ParkingPackageStatus {
    ACTIVE("ACTIVE"),
    INACTIVE("INACTIVE");

    private final String value;

    ParkingPackageStatus(String value){
        this.value = value;
    }
}