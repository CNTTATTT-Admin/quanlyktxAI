package com.cntt.rentalmanagement.controller;

import com.cntt.rentalmanagement.domain.payload.request.LivenessConfigRequest;
import com.cntt.rentalmanagement.domain.payload.response.ApiResponse;
import com.cntt.rentalmanagement.services.ConfigurationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth/config")
public class ConfigurationController {

    @Autowired
    private ConfigurationService configurationService;

    @GetMapping("/face-liveness")
    public ResponseEntity<?> getLivenessConfig() {
        boolean enabled = configurationService.isLivenessEnabled();
        return ResponseEntity.ok(enabled);
    }

    @PostMapping("/face-liveness")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateLivenessConfig(@Valid @RequestBody LivenessConfigRequest request) {
        configurationService.setLivenessEnabled(request.getEnabled());
        return ResponseEntity.ok(new ApiResponse(true, "Cập nhật cấu hình thành công"));
    }
}
