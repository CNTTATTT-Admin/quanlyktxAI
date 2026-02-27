package com.cntt.rentalmanagement.domain.enums;

import lombok.Getter;

@Getter
public enum CheckType {
    CHECK_IN("CHECK_IN"),
    CHECK_OUT("CHECK_OUT");

    private final String value;

    CheckType(String value){
        this.value = value;
    }

}
