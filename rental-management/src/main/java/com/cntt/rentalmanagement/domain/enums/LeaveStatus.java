package com.cntt.rentalmanagement.domain.enums;

public enum LeaveStatus {
    PENDING("PENDING"),
    APPROVED("APPROVED"),
    REJECTED("REJECTED");

    private String value;

    LeaveStatus(String value){
        this.value = value;
    }

    public String getValue(){
        return this.value;
    }
}
