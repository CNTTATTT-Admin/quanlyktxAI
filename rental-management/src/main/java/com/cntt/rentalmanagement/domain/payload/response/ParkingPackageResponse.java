package com.cntt.rentalmanagement.domain.payload.response;

import com.cntt.rentalmanagement.domain.enums.VehicleType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class ParkingPackageResponse {
    private Long id;
    private String name;
    private Integer durationMonths;
    private BigDecimal price;
    private VehicleType vehicleType;
}