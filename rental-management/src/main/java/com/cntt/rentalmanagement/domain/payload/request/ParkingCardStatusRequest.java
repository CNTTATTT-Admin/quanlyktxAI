package com.cntt.rentalmanagement.domain.payload.request;

import com.cntt.rentalmanagement.domain.enums.ParkingCardStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParkingCardStatusRequest {
    private ParkingCardStatus status;
    private String rejectedReason;
}