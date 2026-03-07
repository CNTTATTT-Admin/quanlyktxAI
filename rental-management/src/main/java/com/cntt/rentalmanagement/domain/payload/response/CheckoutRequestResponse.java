package com.cntt.rentalmanagement.domain.payload.response;

import com.cntt.rentalmanagement.domain.enums.CheckoutStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CheckoutRequestResponse {
    private Long id;
    private RoomResponse room;
    private UserResponse user;
    private String reason;
    private CheckoutStatus status;
    private LocalDateTime createdAt;
    
    @Getter
    @Setter
    public static class RoomResponse {
        private Long id;
        private String title;
    }

    @Getter
    @Setter
    public static class UserResponse {
        private Long id;
        private String name;
        private String phone;
    }
}
