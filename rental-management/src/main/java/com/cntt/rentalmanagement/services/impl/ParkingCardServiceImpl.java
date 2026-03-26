package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.enums.ImageType;
import com.cntt.rentalmanagement.domain.enums.ParkingCardStatus;
import com.cntt.rentalmanagement.domain.enums.VehicleType;
import com.cntt.rentalmanagement.domain.enums.InvoiceStatus;
import com.cntt.rentalmanagement.domain.models.Invoice;
import com.cntt.rentalmanagement.domain.models.ParkingCard;
import com.cntt.rentalmanagement.domain.models.ParkingImage;
import com.cntt.rentalmanagement.domain.models.ParkingPackage;
import com.cntt.rentalmanagement.domain.models.Invoice;
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

import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

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
    public Page<ParkingCardResponse> getParkingCardsForUser(Long userId, Integer pageNo, Integer pageSize, String keyword) {
        int page = pageNo == 0 ? pageNo : pageNo - 1;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("id").descending());
        
        Page<ParkingCard> cards = parkingCardRepository.findByUserIdAndKeyword(userId, keyword, pageable);
        return cards.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public MessageResponse updateParkingCardStatus(Long id, ParkingCardStatusRequest request) {
        ParkingCard card = parkingCardRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Thẻ xe không tồn tại!"));

        String oldStatus = card.getStatus().name();
        String newStatus = request.getStatus().name();

        // 1. CẬP NHẬT TRẠNG THÁI THẺ XE
        card.setStatus(request.getStatus());
        
        if (newStatus.equals("REJECTED")) {
            card.setRejectedReason(request.getRejectedReason());
        }

        if (newStatus.equals("ACTIVE") || newStatus.equals("APPROVED_WAITING_PAYMENT")) {
            if (card.getIssueDate() == null) {
                card.setIssueDate(LocalDateTime.now());
            }
        }

        parkingCardRepository.save(card);

        // 2. XỬ LÝ HÓA ĐƠN
        var invoice = invoiceRepository.findFirstByParkingCardIdOrderByIdDesc(card.getId());

        // TRƯỜNG HỢP 1: TẠO MỚI HÓA ĐƠN KHI CHỦ TRỌ DUYỆT THẺ (TỪ PENDING -> APPROVED_WAITING_PAYMENT)
        if (newStatus.equals("APPROVED_WAITING_PAYMENT") && oldStatus.equals("PENDING")) {
            Invoice newInvoice = new Invoice();
            
            newInvoice.setParkingCard(card);
            newInvoice.setUser(card.getUser());
            // Lấy giá tiền từ Gói cước (ParkingPackage) và gán vào amount
            newInvoice.setAmount(card.getParkingPackage().getPrice()); 
            // Đặt trạng thái hóa đơn là PENDING (Theo đúng InvoiceStatus.java của bạn)
            newInvoice.setStatus(InvoiceStatus.PENDING); 
            newInvoice.setCreatedAt(LocalDateTime.now());
            
            invoiceRepository.save(newInvoice);
        } 
        // TRƯỜNG HỢP 2: CẬP NHẬT HÓA ĐƠN ĐÃ CÓ (THANH TOÁN HOẶC HỦY)
        else if (invoice != null) {
            // Khi User thanh toán (APPROVED_WAITING_PAYMENT -> ACTIVE)
            if (newStatus.equals("ACTIVE") && oldStatus.equals("APPROVED_WAITING_PAYMENT")) {
                invoice.setStatus(InvoiceStatus.PAID); 
                invoice.setPaidAt(LocalDateTime.now()); // Lưu lại thời gian thanh toán
                invoice.setPaymentMethod("Chuyển khoản"); 
                invoiceRepository.save(invoice);
            }
            
            // Khi User hủy yêu cầu đăng ký thẻ (PENDING/APPROVED_WAITING_PAYMENT -> CANCELLED)
            if (newStatus.equals("CANCELLED") && invoice.getStatus().name().equals("PENDING")) {
                invoice.setStatus(InvoiceStatus.CANCELLED); 
                invoiceRepository.save(invoice);
            }
        }

        return MessageResponse.builder().message("Cập nhật trạng thái thẻ xe thành công!").build();
    }
    @Override
    @Transactional
    public MessageResponse registerParkingCard(Long userId, ParkingCardRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại"));
        
        ParkingPackage parkingPackage = parkingPackageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new BadRequestException("Gói gửi xe không tồn tại"));

        List<ParkingCardStatus> activeStatuses = Arrays.asList(
            ParkingCardStatus.PENDING,
            ParkingCardStatus.APPROVED_WAITING_PAYMENT,
            ParkingCardStatus.ACTIVE
        );

        if (parkingCardRepository.existsByLicensePlateAndStatusIn(request.getLicensePlate(), activeStatuses)) {
            throw new BadRequestException("Biển số xe này hiện đang được đăng ký ở một thẻ khác (Chờ duyệt hoặc Đang hoạt động). Vui lòng hủy thẻ cũ trước khi đăng ký lại!");
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
        ParkingCardResponse.InvoiceDetail invoiceDetail = null;

        var invoice = invoiceRepository.findFirstByParkingCardIdOrderByIdDesc(card.getId());
        if (invoice != null) {
            invStatus = invoice.getStatus().name();

            invoiceDetail = ParkingCardResponse.InvoiceDetail.builder()
                    .id(invoice.getId())
                    .amount(invoice.getAmount())
                    .status(invoice.getStatus().name())
                    .paymentMethod(invoice.getPaymentMethod())
                    .transactionId(invoice.getTransactionId())
                    .paidAt(invoice.getPaidAt())
                    .build();
        }

        //Tìm ảnh xe
        List<String> vehicleImages = parkingImageRepository.findByParkingCardId(card.getId())
                .stream()
                .map(ParkingImage::getImageUrl)
                .collect(Collectors.toList());

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
                .invoice(invoiceDetail)
                .vehicleImages(vehicleImages)
                .build();
    }
}