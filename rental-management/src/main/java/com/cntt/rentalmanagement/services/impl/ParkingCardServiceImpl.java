package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.models.ParkingCard;
import com.cntt.rentalmanagement.domain.payload.request.ParkingCardStatusRequest;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.domain.payload.response.ParkingCardResponse;
import com.cntt.rentalmanagement.domain.payload.response.UserResponse;
import com.cntt.rentalmanagement.exception.BadRequestException;
import com.cntt.rentalmanagement.repository.ParkingCardRepository;
import com.cntt.rentalmanagement.repository.InvoiceRepository;
import com.cntt.rentalmanagement.services.ParkingCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ParkingCardServiceImpl implements ParkingCardService {

    private final ParkingCardRepository parkingCardRepository;
    private final InvoiceRepository invoiceRepository;

    @Override
    public Page<ParkingCardResponse> getAllParkingCardsForRentaler(Long rentalerId, Integer pageNo, Integer pageSize, String keyword) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("id").descending());
        
        Page<ParkingCard> cards = parkingCardRepository.findByRentalerIdAndKeyword(rentalerId, keyword, pageable);
        return cards.map(this::mapToResponse);
    }

    @Override
    public Page<ParkingCardResponse> getParkingCardsForUser(Long userId, Integer pageNo, Integer pageSize) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("id").descending());
        
        Page<ParkingCard> cards = parkingCardRepository.findByUserId(userId, pageable);
        return cards.map(this::mapToResponse);
    }

    @Override
    public MessageResponse updateParkingCardStatus(Long id, ParkingCardStatusRequest request) {
        ParkingCard card = parkingCardRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Thẻ xe không tồn tại!"));

        card.setStatus(request.getStatus());
        
        if (request.getStatus().name().equals("REJECTED")) {
            card.setRejectedReason(request.getRejectedReason());
        }

        if (request.getStatus().name().equals("ACTIVE") || request.getStatus().name().equals("APPROVED_WAITING_PAYMENT")) {
            if (card.getIssueDate() == null) {
                card.setIssueDate(java.time.LocalDateTime.now());
            }
        }

        parkingCardRepository.save(card);
        return MessageResponse.builder().message("Cập nhật trạng thái thẻ xe thành công!").build();
    }

    private ParkingCardResponse mapToResponse(ParkingCard card) {

        UserResponse userResponse = new UserResponse();
        userResponse.setId(card.getUser().getId());
        userResponse.setName(card.getUser().getName());
        userResponse.setPhone(card.getUser().getPhone());

        ParkingCardResponse.ParkingPackageInfo packageInfo = null;
        if (card.getParkingPackage() != null) {
            packageInfo = ParkingCardResponse.ParkingPackageInfo.builder()
                    .id(card.getParkingPackage().getId())
                    .name(card.getParkingPackage().getName())
                    .price(card.getParkingPackage().getPrice())
                    .build();
        }

        String invStatus = null;
        var invoice = invoiceRepository.findFirstByParkingCardIdOrderByIdDesc(card.getId());
        if (invoice != null) {
            invStatus = invoice.getStatus().name(); 
        }

        return ParkingCardResponse.builder()
                .id(card.getId())
                .licensePlate(card.getLicensePlate())
                .brandModel(card.getBrandModel())
                .color(card.getColor())
                .vehicleType(card.getVehicleType())
                .registrationImageUrl(card.getRegistrationImageUrl())
                .status(card.getStatus())
                .rejectedReason(card.getRejectedReason())
                .issueDate(card.getIssueDate())
                .expiryDate(card.getExpiryDate())
                .user(userResponse)
                .packageInfo(packageInfo)
                .invoiceStatus(invStatus)
                .build();
    }
}