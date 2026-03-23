package com.cntt.rentalmanagement.domain.models;

import com.cntt.rentalmanagement.domain.enums.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private BigDecimal amount;
    private LocalDateTime paidAt;
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status;
    
    private String transactionId;

    @ManyToOne
    @JoinColumn(name = "parking_card_id")
    private ParkingCard parkingCard;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}