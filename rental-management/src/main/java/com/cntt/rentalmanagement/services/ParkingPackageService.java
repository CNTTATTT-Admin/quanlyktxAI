package com.cntt.rentalmanagement.services;

import com.cntt.rentalmanagement.domain.payload.request.ParkingPackageRequest;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.domain.payload.response.ParkingPackageResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ParkingPackageService {
    List<ParkingPackageResponse> getPackagesByRentaler(Long rentalerId);
    Page<ParkingPackageResponse> getAllParkingPackages(Long rentalerId, Integer pageNo, Integer pageSize, String keyword);
    MessageResponse createParkingPackage(Long rentalerId, ParkingPackageRequest request);
    MessageResponse updateParkingPackage(Long rentalerId, Long id, ParkingPackageRequest request);
}