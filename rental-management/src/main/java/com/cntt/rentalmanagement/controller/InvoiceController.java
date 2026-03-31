package com.cntt.rentalmanagement.controller;

import com.cntt.rentalmanagement.domain.enums.InvoiceStatus;
import com.cntt.rentalmanagement.secruity.TokenProvider;
import com.cntt.rentalmanagement.services.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final TokenProvider tokenProvider;

    @GetMapping("/rentaler")
    public ResponseEntity<?> getInvoicesForRentaler(
            @RequestHeader("Authorization") String token,
            @RequestParam Integer pageNo,
            @RequestParam Integer pageSize,
            @RequestParam(required = false, defaultValue = "") String keyword) {
        
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        Long rentalerId = tokenProvider.getUserIdFromToken(token);
        
        return ResponseEntity.ok(invoiceService.getInvoicesForRentaler(rentalerId, pageNo, pageSize, keyword));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateInvoiceStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String paymentMethod
            ) {
        InvoiceStatus invoiceStatus = InvoiceStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(invoiceService.updateInvoiceStatus(id, invoiceStatus, paymentMethod));
    }

    @PostMapping("/renew/parking-card/{cardId}")
    public ResponseEntity<?> createRenewalInvoice(@PathVariable Long cardId) {
        return ResponseEntity.ok(invoiceService.createRenewalInvoice(cardId));
    }
}