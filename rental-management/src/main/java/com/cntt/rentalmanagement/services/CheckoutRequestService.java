package com.cntt.rentalmanagement.services;

import com.cntt.rentalmanagement.domain.models.CheckoutRequest;
import com.cntt.rentalmanagement.domain.payload.response.CheckoutRequestResponse;
import com.cntt.rentalmanagement.domain.payload.request.CheckoutRequestPayload;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import org.springframework.data.domain.Page;

public interface CheckoutRequestService {
    MessageResponse createRequest(CheckoutRequestPayload payload, Long userId);
    MessageResponse approveRequest(Long id);
    MessageResponse rejectRequest(Long id);
    Page<CheckoutRequestResponse> getRequestsForRentaler(Long rentalerId, Integer pageNo, Integer pageSize);
    Page<CheckoutRequestResponse> getRequestsForUser(Long userId, Integer pageNo, Integer pageSize);
}
