package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.enums.ParkingPackageStatus;
import com.cntt.rentalmanagement.domain.models.ParkingPackage;
import com.cntt.rentalmanagement.domain.payload.response.ParkingPackageResponse;
import com.cntt.rentalmanagement.repository.ParkingPackageRepository;
import com.cntt.rentalmanagement.services.ParkingPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParkingPackageServiceImpl implements ParkingPackageService {

    private final ParkingPackageRepository parkingPackageRepository;

    @Override
    public List<ParkingPackageResponse> getPackagesByRentaler(Long rentalerId) {
        List<ParkingPackage> packages = parkingPackageRepository
                .findByRentalerIdAndStatus(rentalerId, ParkingPackageStatus.ACTIVE);

        return packages.stream().map(pkg -> ParkingPackageResponse.builder()
                .id(pkg.getId())
                .name(pkg.getName())
                .durationMonths(pkg.getDurationMonths())
                .price(pkg.getPrice())
                .vehicleType(pkg.getVehicleType())
                .build()
        ).collect(Collectors.toList());
    }
}