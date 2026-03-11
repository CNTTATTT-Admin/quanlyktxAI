package com.cntt.rentalmanagement.domain.enums;

import lombok.Getter;

@Getter
public enum RoomStatus {
    AVAILABLE("AVAILABLE"),          // Phòng trống hoàn toàn
    PARTIALLY_FILLED("PARTIALLY_FILLED"), // Phòng đã có người nhưng còn chỗ
    FULL("FULL"),                    // Phòng đã hết chỗ
    MAINTENANCE("MAINTENANCE"),      // Đang bảo trì (thay thế CHECKED_OUT)
    
    // Giữ lại các giá trị cũ để tránh lỗi mapping nếu DB đã có dữ liệu, 
    // nhưng sẽ migrate logic sang các cái trên
    ROOM_RENT("ROOM_RENT"), 
    HIRED("HIRED"),
    CHECKED_OUT("CHECKED_OUT");

    private final String value;

    RoomStatus(String value){
        this.value = value;
    }
}
