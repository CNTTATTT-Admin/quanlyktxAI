package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.enums.InvoiceStatus;
import com.cntt.rentalmanagement.domain.enums.ParkingCardStatus;
import com.cntt.rentalmanagement.domain.models.Invoice;
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

import java.time.LocalDateTime;

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
    public MessageResponse updateInvoiceStatus(Long id, InvoiceStatus status) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Hóa đơn không tồn tại"));

        invoice.setStatus(status);

        if (status == InvoiceStatus.PAID) {
            invoice.setPaidAt(LocalDateTime.now());
            if (invoice.getPaymentMethod() == null) {
                invoice.setPaymentMethod("Tiền mặt");
            }
            
            if (invoice.getParkingCard() != null) {
                var card = invoice.getParkingCard();
                card.setStatus(ParkingCardStatus.ACTIVE);
                
                if (card.getIssueDate() == null) {
                    card.setIssueDate(LocalDateTime.now());
                }
                parkingCardRepository.save(card);
            }
            
        } else if (status == InvoiceStatus.CANCELLED || status == InvoiceStatus.FAILED) {
            invoice.setPaidAt(null);
            
            if (invoice.getParkingCard() != null && status == InvoiceStatus.CANCELLED) {
                var card = invoice.getParkingCard();
                card.setStatus(ParkingCardStatus.CANCELLED);
                parkingCardRepository.save(card);
            }
        }

        invoiceRepository.save(invoice);
        return MessageResponse.builder().message("Cập nhật trạng thái hóa đơn thành công!").build();
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