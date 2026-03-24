package com.cntt.rentalmanagement.services;

import com.cntt.rentalmanagement.domain.payload.request.ParkingCardStatusRequest;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.domain.payload.response.ParkingCardResponse;
import org.springframework.data.domain.Page;

public interface ParkingCardService {
    Page<ParkingCardResponse> getAllParkingCardsForRentaler(Long rentalerId, Integer pageNo, Integer pageSize, String keyword);
    
    Page<ParkingCardResponse> getParkingCardsForUser(Long userId, Integer pageNo, Integer pageSize);
    
    MessageResponse updateParkingCardStatus(Long id, ParkingCardStatusRequest request);
}