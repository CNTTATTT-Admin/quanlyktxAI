package com.cntt.rentalmanagement.controller;

import com.cntt.rentalmanagement.domain.payload.request.CheckoutRequestPayload;
import com.cntt.rentalmanagement.secruity.TokenProvider;
import com.cntt.rentalmanagement.services.CheckoutRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/checkout-request")
@RequiredArgsConstructor
public class CheckoutRequestController {

    private final CheckoutRequestService checkoutRequestService;
    private final TokenProvider tokenProvider;

    @PostMapping("/user/create")
    public ResponseEntity<?> createRequest(@RequestBody CheckoutRequestPayload payload,
                                           @RequestHeader("Authorization") String token) {
        token = token.substring(7);
        Long userId = tokenProvider.getUserIdFromToken(token);
        return ResponseEntity.ok(checkoutRequestService.createRequest(payload, userId));
    }

    @PutMapping("/rentaler/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(checkoutRequestService.approveRequest(id));
    }

    @PutMapping("/rentaler/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id) {
        return ResponseEntity.ok(checkoutRequestService.rejectRequest(id));
    }

    @GetMapping("/rentaler/history")
    public ResponseEntity<?> getRequestsForRentaler(
            @RequestHeader("Authorization") String token,
            @RequestParam Integer pageNo,
            @RequestParam Integer pageSize) {
        token = token.substring(7);
        Long userId = tokenProvider.getUserIdFromToken(token);
        return ResponseEntity.ok(checkoutRequestService.getRequestsForRentaler(userId, pageNo, pageSize));
    }

    @GetMapping("/user/history")
    public ResponseEntity<?> getRequestsForUser(
            @RequestHeader("Authorization") String token,
            @RequestParam Integer pageNo,
            @RequestParam Integer pageSize) {
        token = token.substring(7);
        Long userId = tokenProvider.getUserIdFromToken(token);
        return ResponseEntity.ok(checkoutRequestService.getRequestsForUser(userId, pageNo, pageSize));
    }
}
