package com.cntt.rentalmanagement.controller;

import com.cntt.rentalmanagement.domain.models.LeaveRequest;
import com.cntt.rentalmanagement.domain.payload.LeaveRequestRequest;
import com.cntt.rentalmanagement.services.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/leave-request")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @PostMapping
    public ResponseEntity<LeaveRequest> createLeaveRequest(@Valid @RequestBody LeaveRequestRequest request) {
        return ResponseEntity.ok(leaveRequestService.createLeaveRequest(request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<LeaveRequest> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(leaveRequestService.updateStatus(id, status));
    }

    @GetMapping("/user")
    public ResponseEntity<Page<LeaveRequest>> getRequestsByUser(
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return ResponseEntity.ok(leaveRequestService.getRequestsByUser(pageNo, pageSize));
    }

    @GetMapping("/rentaler")
    public ResponseEntity<Page<LeaveRequest>> getRequestsForRentaler(
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return ResponseEntity.ok(leaveRequestService.getRequestsForRentaler(pageNo, pageSize));
    }
}
