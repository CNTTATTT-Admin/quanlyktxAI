package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.enums.InvoiceStatus;
import com.cntt.rentalmanagement.domain.enums.ParkingCardStatus;
import com.cntt.rentalmanagement.domain.models.Invoice;
import com.cntt.rentalmanagement.domain.models.ParkingCard;
import com.cntt.rentalmanagement.domain.payload.response.InvoiceResponse;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.exception.BadRequestException;
import com.cntt.rentalmanagement.repository.InvoiceRepository;
import com.cntt.rentalmanagement.repository.ParkingCardRepository;
import com.cntt.rentalmanagement.services.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ParkingCardRepository parkingCardRepository;

    @Override
    public Page<InvoiceResponse> getInvoicesForRentaler(Long rentalerId, Integer pageNo, Integer pageSize, String keyword) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("id").descending());
        
        Page<Invoice> invoices = invoiceRepository.findByRentalerIdAndKeyword(rentalerId, keyword, pageable);
        return invoices.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public MessageResponse updateInvoiceStatus(Long id, InvoiceStatus status, String paymentMethod) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Hóa đơn không tồn tại"));

        invoice.setStatus(status);
        LocalDateTime now = LocalDateTime.now();
        if (status == InvoiceStatus.PAID) {
            invoice.setPaidAt(now);
            if (paymentMethod != null && !paymentMethod.trim().isEmpty()) {
                invoice.setPaymentMethod(paymentMethod);
            } else if (invoice.getPaymentMethod() == null) {
                invoice.setPaymentMethod("Tiền mặt");
            } 
            if (invoice.getParkingCard() != null) {
                var card = invoice.getParkingCard();
                card.setStatus(ParkingCardStatus.ACTIVE);
                if (card.getIssueDate() == null) {
                    card.setIssueDate(now);
                }

                if (card.getParkingPackage() != null) {
                    int durationMonths = card.getParkingPackage().getDurationMonths();
                    
                    if (card.getExpiryDate() != null && card.getExpiryDate().isAfter(now)) {
                        card.setExpiryDate(card.getExpiryDate().plusMonths(durationMonths));
                    } else {
                        card.setExpiryDate(now.plusMonths(durationMonths));
                    }
                }

                card.setUpdatedAt(now);
                parkingCardRepository.save(card);
            }   
        } else if (status == InvoiceStatus.CANCELLED || status == InvoiceStatus.FAILED) {
            invoice.setPaidAt(null);
            
            if (invoice.getParkingCard() != null && status == InvoiceStatus.CANCELLED) {
                var card = invoice.getParkingCard();
                if (card.getStatus() == ParkingCardStatus.APPROVED_WAITING_PAYMENT) {
                    card.setStatus(ParkingCardStatus.CANCELLED);
                    card.setUpdatedAt(now);
                    parkingCardRepository.save(card);
                }
            }
        }
        invoice.setUpdatedAt(now);
        invoiceRepository.save(invoice);
        return MessageResponse.builder().message("Cập nhật trạng thái hóa đơn thành công!").build();
    }

    @Override
    @Transactional
    public InvoiceResponse createRenewalInvoice(Long parkingCardId) {
        ParkingCard card = parkingCardRepository.findById(parkingCardId)
                .orElseThrow(() -> new BadRequestException("Thẻ xe không tồn tại"));

        if (card.getStatus() != ParkingCardStatus.ACTIVE && card.getStatus() != ParkingCardStatus.EXPIRED) {
            throw new BadRequestException("Chỉ có thể gia hạn thẻ đang hoạt động hoặc đã hết hạn.");
        }

        Invoice newInvoice = new Invoice();
        newInvoice.setAmount(card.getParkingPackage().getPrice());
        newInvoice.setStatus(InvoiceStatus.PENDING);
        newInvoice.setParkingCard(card);
        newInvoice.setUser(card.getUser()); 
        newInvoice.setCreatedAt(LocalDateTime.now());
        newInvoice.setUpdatedAt(LocalDateTime.now());

        Invoice savedInvoice = invoiceRepository.save(newInvoice);

        return mapToResponse(savedInvoice);
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void autoCancelExpiredInvoices() {

        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(15);
        
        List<Invoice> expiredInvoices = invoiceRepository.findByStatusAndCreatedAtBefore(InvoiceStatus.PENDING, cutoffTime);

        for (Invoice invoice : expiredInvoices) {
            invoice.setStatus(InvoiceStatus.CANCELLED);
            invoice.setUpdatedAt(LocalDateTime.now());
            
            if (invoice.getParkingCard() != null) {
                var card = invoice.getParkingCard();
                if (card.getStatus() == ParkingCardStatus.APPROVED_WAITING_PAYMENT) {
                    card.setStatus(ParkingCardStatus.CANCELLED);
                    card.setUpdatedAt(LocalDateTime.now());
                    parkingCardRepository.save(card);
                }
            }
        }
        
        if (!expiredInvoices.isEmpty()) {
            invoiceRepository.saveAll(expiredInvoices);
            System.out.println("Đã tự động hủy " + expiredInvoices.size() + " hóa đơn VNPAY quá hạn 15 phút.");
        }
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        InvoiceResponse.UserInfo userInfo = null;
        if (invoice.getUser() != null) {
            userInfo = InvoiceResponse.UserInfo.builder()
                    .id(invoice.getUser().getId())
                    .name(invoice.getUser().getName())
                    .phone(invoice.getUser().getPhone())
                    .build();
        }

        InvoiceResponse.PackageInfo packageInfo = null;
        if (invoice.getParkingCard() != null && invoice.getParkingCard().getParkingPackage() != null) {
            packageInfo = InvoiceResponse.PackageInfo.builder()
                    .id(invoice.getParkingCard().getParkingPackage().getId())
                    .name(invoice.getParkingCard().getParkingPackage().getName())
                    .build();
        }

        InvoiceResponse.ParkingCardInfo cardInfo = null;
        if (invoice.getParkingCard() != null) {
            cardInfo = InvoiceResponse.ParkingCardInfo.builder()
                    .id(invoice.getParkingCard().getId())
                    .licensePlate(invoice.getParkingCard().getLicensePlate())
                    .packageInfo(packageInfo)
                    .build();
        }

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .amount(invoice.getAmount())
                .status(invoice.getStatus() != null ? invoice.getStatus().name() : null)
                .paymentMethod(invoice.getPaymentMethod())
                .transactionId(invoice.getTransactionId())
                .paidAt(invoice.getPaidAt())
                .createdAt(invoice.getCreatedAt()) 
                .user(userInfo)
                .parkingCard(cardInfo)
                .build();
    }
}