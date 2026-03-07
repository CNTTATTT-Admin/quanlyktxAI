package com.cntt.rentalmanagement.domain.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class MaintenanceResponse {
    private Long id;
    private LocalDateTime maintenanceDate;
    private BigDecimal price;
    private LocalDateTime createdAt;
    private RoomResponse room;
    private String files;
    private String status;
    private String description;
    private UserResponse reportedBy;
}
