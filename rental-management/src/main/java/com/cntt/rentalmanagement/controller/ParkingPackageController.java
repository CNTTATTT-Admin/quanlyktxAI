package com.cntt.rentalmanagement.controller;

import com.cntt.rentalmanagement.domain.payload.request.ParkingPackageRequest;
import com.cntt.rentalmanagement.secruity.TokenProvider;
import com.cntt.rentalmanagement.services.ParkingPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/parking-packages")
@RequiredArgsConstructor
public class ParkingPackageController {

    private final ParkingPackageService parkingPackageService;
    private final TokenProvider tokenProvider;

    @GetMapping("/rentaler/{rentalerId}")
    public ResponseEntity<?> getPackagesByRentaler(@PathVariable Long rentalerId) {
        return ResponseEntity.ok(parkingPackageService.getPackagesByRentaler(rentalerId));
    }

    @GetMapping("/rentaler")
    public ResponseEntity<?> getAllParkingPackages(
            @RequestHeader("Authorization") String token,
            @RequestParam Integer pageNo,
            @RequestParam Integer pageSize,
            @RequestParam(required = false, defaultValue = "") String keyword) {
        
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        Long rentalerId = tokenProvider.getUserIdFromToken(token);
        
        return ResponseEntity.ok(parkingPackageService.getAllParkingPackages(rentalerId, pageNo, pageSize, keyword));
    }

    @PostMapping
    public ResponseEntity<?> createParkingPackage(
            @RequestHeader("Authorization") String token,
            @RequestBody ParkingPackageRequest request) {
        
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        Long rentalerId = tokenProvider.getUserIdFromToken(token);
        return ResponseEntity.ok(parkingPackageService.createParkingPackage(rentalerId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateParkingPackage(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody ParkingPackageRequest request) {
        
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        Long rentalerId = tokenProvider.getUserIdFromToken(token);
        return ResponseEntity.ok(parkingPackageService.updateParkingPackage(rentalerId, id, request));
    }
}