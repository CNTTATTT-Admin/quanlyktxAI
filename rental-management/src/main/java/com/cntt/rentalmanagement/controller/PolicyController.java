package com.cntt.rentalmanagement.controller;

import com.cntt.rentalmanagement.domain.models.Policy;
import com.cntt.rentalmanagement.services.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/policy")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;

    @GetMapping
    public ResponseEntity<?> getPolicy() {
        return ResponseEntity.ok(policyService.getActivePolicy());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updatePolicy(@RequestBody Policy policy) {
        return ResponseEntity.ok(policyService.createPolicy(policy));
    }
}
