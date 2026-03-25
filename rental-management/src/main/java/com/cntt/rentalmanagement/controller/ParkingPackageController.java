package com.cntt.rentalmanagement.controller;

import com.cntt.rentalmanagement.services.ParkingPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/parking-packages")
@RequiredArgsConstructor
public class ParkingPackageController {

    private final ParkingPackageService parkingPackageService;

    @GetMapping("/rentaler/{rentalerId}")
    public ResponseEntity<?> getPackagesByRentaler(@PathVariable Long rentalerId) {
        return ResponseEntity.ok(parkingPackageService.getPackagesByRentaler(rentalerId));
    }
}