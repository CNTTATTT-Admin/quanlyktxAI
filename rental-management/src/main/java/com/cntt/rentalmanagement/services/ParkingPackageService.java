package com.cntt.rentalmanagement.services;

import com.cntt.rentalmanagement.domain.payload.response.ParkingPackageResponse;
import java.util.List;

public interface ParkingPackageService {
    List<ParkingPackageResponse> getPackagesByRentaler(Long rentalerId);
}