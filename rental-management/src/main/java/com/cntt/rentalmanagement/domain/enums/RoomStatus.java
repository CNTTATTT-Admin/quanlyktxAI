package com.cntt.rentalmanagement.domain.enums;

import lombok.Getter;

@Getter
public enum RoomStatus {
    HIRED("HIRED"), // Deprecated: use OCCUPIED
    ROOM_RENT("ROOM_RENT"), // Deprecated: use AVAILABLE
    CHECKED_OUT("CHECKED_OUT"), // Deprecated: use MAINTENANCE
    
    AVAILABLE("AVAILABLE"),
    OCCUPIED("OCCUPIED"),
    MAINTENANCE("MAINTENANCE");


    private final String value;

    RoomStatus(String value){
        this.value = value;
    }

}
