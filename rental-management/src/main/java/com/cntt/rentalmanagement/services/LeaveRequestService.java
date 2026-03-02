package com.cntt.rentalmanagement.services;

import com.cntt.rentalmanagement.domain.payload.LeaveRequestRequest;
import com.cntt.rentalmanagement.domain.models.LeaveRequest;
import org.springframework.data.domain.Page;

public interface LeaveRequestService {
    LeaveRequest createLeaveRequest(LeaveRequestRequest request);
    LeaveRequest updateStatus(Long id, String status);
    Page<LeaveRequest> getRequestsByUser(Integer pageNo, Integer pageSize);
    Page<LeaveRequest> getRequestsForRentaler(Integer pageNo, Integer pageSize);
}
