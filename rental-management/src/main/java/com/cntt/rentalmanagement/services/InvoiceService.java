package com.cntt.rentalmanagement.services;

import com.cntt.rentalmanagement.domain.enums.InvoiceStatus;
import com.cntt.rentalmanagement.domain.payload.response.InvoiceResponse;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import org.springframework.data.domain.Page;

public interface InvoiceService {
    Page<InvoiceResponse> getInvoicesForRentaler(Long rentalerId, Integer pageNo, Integer pageSize, String keyword);
    
    MessageResponse updateInvoiceStatus(Long id, InvoiceStatus status, String paymentMethod);
}