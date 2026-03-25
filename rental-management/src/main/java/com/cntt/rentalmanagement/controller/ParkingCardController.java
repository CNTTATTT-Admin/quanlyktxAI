package com.cntt.rentalmanagement.controller;

import com.cntt.rentalmanagement.domain.payload.request.ParkingCardRequest;
import com.cntt.rentalmanagement.domain.payload.request.ParkingCardStatusRequest;
import com.cntt.rentalmanagement.secruity.TokenProvider;
import com.cntt.rentalmanagement.services.ParkingCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/parking-cards")
@RequiredArgsConstructor
public class ParkingCardController {

    private final ParkingCardService parkingCardService;
    private final TokenProvider tokenProvider;

    @GetMapping("/rentaler")
    public ResponseEntity<?> getAllParkingCardsForRentaler(
            @RequestHeader("Authorization") String token,
            @RequestParam Integer pageNo,
            @RequestParam Integer pageSize,
            @RequestParam(required = false, defaultValue = "") String keyword) {
        
        token = token.substring(7);
        Long rentalerId = tokenProvider.getUserIdFromToken(token);
        return ResponseEntity.ok(parkingCardService.getAllParkingCardsForRentaler(rentalerId, pageNo, pageSize, keyword));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateParkingCardStatus(
            @PathVariable Long id,
            @RequestBody ParkingCardStatusRequest request) {
        return ResponseEntity.ok(parkingCardService.updateParkingCardStatus(id, request));
    }

    @PostMapping(value = "/user/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registerParkingCard(
            @RequestHeader("Authorization") String token,
            @ModelAttribute ParkingCardRequest request) {
        
        token = token.substring(7);
        Long userId = tokenProvider.getUserIdFromToken(token);
        
        return ResponseEntity.ok(parkingCardService.registerParkingCard(userId, request));
    }

    @GetMapping("/user")
    public ResponseEntity<?> getParkingCardsForUser(
            @RequestHeader("Authorization") String token,
            @RequestParam Integer pageNo,
            @RequestParam Integer pageSize) {
        
        token = token.substring(7);
        Long userId = tokenProvider.getUserIdFromToken(token);
        
        return ResponseEntity.ok(parkingCardService.getParkingCardsForUser(userId, pageNo, pageSize));
    }

}