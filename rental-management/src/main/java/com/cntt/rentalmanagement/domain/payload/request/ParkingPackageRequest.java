package com.cntt.rentalmanagement.domain.payload.request;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class ParkingPackageRequest {
    private String name;
    private Integer durationMonths;
    private BigDecimal price;
    private String vehicleType;
    private String status;
}