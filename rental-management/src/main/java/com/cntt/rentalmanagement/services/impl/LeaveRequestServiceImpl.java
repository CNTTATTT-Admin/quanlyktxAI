package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.enums.LeaveStatus;
import com.cntt.rentalmanagement.domain.models.LeaveRequest;
import com.cntt.rentalmanagement.domain.models.User;
import com.cntt.rentalmanagement.domain.payload.LeaveRequestRequest;
import com.cntt.rentalmanagement.exception.BadRequestException;
import com.cntt.rentalmanagement.exception.ResourceNotFoundException;
import com.cntt.rentalmanagement.repository.LeaveRequestRepository;
import com.cntt.rentalmanagement.repository.UserRepository;
import com.cntt.rentalmanagement.services.BaseService;
import com.cntt.rentalmanagement.services.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LeaveRequestServiceImpl extends BaseService implements LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;

    @Override
    public LeaveRequest createLeaveRequest(LeaveRequestRequest request) {
        if (request.getStartDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Ngày bắt đầu không được ở quá khứ.");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("Ngày kết thúc không được trước ngày bắt đầu.");
        }

        User user = userRepository.findById(getUserId()).orElseThrow(() -> new ResourceNotFoundException("User", "id", getUserId()));
        
        LeaveRequest leaveRequest = new LeaveRequest(
                user,
                request.getReason(),
                request.getStartDate(),
                request.getEndDate(),
                LeaveStatus.PENDING
        );

        return leaveRequestRepository.save(leaveRequest);
    }

    @Override
    public LeaveRequest updateStatus(Long id, String status) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", id));
        
        try {
            leaveRequest.setStatus(LeaveStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Trạng thái không hợp lệ.");
        }
        
        return leaveRequestRepository.save(leaveRequest);
    }

    @Override
    public Page<LeaveRequest> getRequestsByUser(Integer pageNo, Integer pageSize) {
        User user = userRepository.findById(getUserId()).orElseThrow(() -> new ResourceNotFoundException("User", "id", getUserId()));
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("createdAt").descending());
        return leaveRequestRepository.findByUser(user, pageable);
    }

    @Override
    public Page<LeaveRequest> getRequestsForRentaler(Integer pageNo, Integer pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("createdAt").descending());
        // For simplicity in demo, Rentaler sees all requests. 
        // In a real app, we might filter by the rooms the rentaler manages.
        return leaveRequestRepository.findAll(pageable);
    }
}
