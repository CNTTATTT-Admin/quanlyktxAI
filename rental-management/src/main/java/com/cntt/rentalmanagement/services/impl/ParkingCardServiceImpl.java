package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.enums.ImageType;
import com.cntt.rentalmanagement.domain.enums.ParkingCardStatus;
import com.cntt.rentalmanagement.domain.enums.VehicleType;
import com.cntt.rentalmanagement.domain.models.ParkingCard;
import com.cntt.rentalmanagement.domain.models.ParkingImage;
import com.cntt.rentalmanagement.domain.models.ParkingPackage;
import com.cntt.rentalmanagement.domain.models.User;
import com.cntt.rentalmanagement.domain.payload.request.ParkingCardRequest;
import com.cntt.rentalmanagement.domain.payload.request.ParkingCardStatusRequest;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.domain.payload.response.ParkingCardResponse;
import com.cntt.rentalmanagement.domain.payload.response.UserResponse;
import com.cntt.rentalmanagement.exception.BadRequestException;
import com.cntt.rentalmanagement.repository.ParkingCardRepository;
import com.cntt.rentalmanagement.repository.ParkingImageRepository;
import com.cntt.rentalmanagement.repository.ParkingPackageRepository;
import com.cntt.rentalmanagement.repository.UserRepository;
import com.cntt.rentalmanagement.repository.InvoiceRepository;
import com.cntt.rentalmanagement.services.FileStorageService;
import com.cntt.rentalmanagement.services.ParkingCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ParkingCardServiceImpl implements ParkingCardService {

    private final ParkingCardRepository parkingCardRepository;
    private final InvoiceRepository invoiceRepository;
    private final ParkingImageRepository parkingImageRepository;
    private final ParkingPackageRepository parkingPackageRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

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

    @Override
    @Transactional
    public MessageResponse registerParkingCard(Long userId, ParkingCardRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại"));
        
        ParkingPackage parkingPackage = parkingPackageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new BadRequestException("Gói gửi xe không tồn tại"));

        if (parkingCardRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new BadRequestException("Biển số xe này đã được đăng ký trong hệ thống!");
        }

        if (request.getRegistrationImage() == null || request.getRegistrationImage().isEmpty()) {
            throw new BadRequestException("Vui lòng tải lên ảnh giấy đăng ký xe (Cà vẹt).");
        }
        
        String registrationImageUrl = uploadAndGetUrl(request.getRegistrationImage());

        ParkingCard parkingCard = new ParkingCard();
        parkingCard.setUser(user);
        parkingCard.setParkingPackage(parkingPackage);
        parkingCard.setLicensePlate(request.getLicensePlate());
        parkingCard.setBrandModel(request.getBrandModel());
        parkingCard.setColor(request.getColor());
        parkingCard.setVehicleType(VehicleType.valueOf(request.getVehicleType().toUpperCase()));
        parkingCard.setRegistrationImageUrl(registrationImageUrl);
        parkingCard.setStatus(ParkingCardStatus.PENDING); 
        
        parkingCard = parkingCardRepository.save(parkingCard);

        if (request.getVehicleImages() != null && !request.getVehicleImages().isEmpty()) {
            for (MultipartFile file : request.getVehicleImages()) {
                if (file != null && !file.isEmpty()) {
                    String imageUrl = uploadAndGetUrl(file);
                    ParkingImage parkingImage = new ParkingImage();
                    parkingImage.setParkingCard(parkingCard);
                    parkingImage.setImageUrl(imageUrl);
                    parkingImage.setImageType(ImageType.OTHER); 
                    parkingImageRepository.save(parkingImage);
                }
            }
        }

        return MessageResponse.builder().message("Đăng ký thẻ xe thành công. Vui lòng chờ Chủ trọ phê duyệt!").build();
    }

    //Hàm upload ảnh
    private String uploadAndGetUrl(MultipartFile file) {
        String image = fileStorageService.storeFile(file).replace("photographer/files/", "");
        return "http://localhost:8080/image/" + image;
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