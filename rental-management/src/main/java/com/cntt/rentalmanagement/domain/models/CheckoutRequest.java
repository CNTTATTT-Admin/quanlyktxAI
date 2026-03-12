package com.cntt.rentalmanagement.domain.models;

import com.cntt.rentalmanagement.domain.enums.CheckoutStatus;
import com.cntt.rentalmanagement.domain.models.audit.DateAudit;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;

@Entity
@Table(name = "checkout_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest extends DateAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    private CheckoutStatus status;
}
