package com.cntt.rentalmanagement.domain.models;

import com.cntt.rentalmanagement.domain.enums.ParkingCardStatus;
import com.cntt.rentalmanagement.domain.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "parking_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ParkingCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "brand_model", nullable = false)
    private String brandModel;

    @Column(nullable = false)
    private String color;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "issue_date")
    private LocalDateTime issueDate;

    @Column(name = "license_plate", nullable = false)
    private String licensePlate;

    @Column(name = "registration_image_url", nullable = false, length = 500)
    private String registrationImageUrl;

    @Column(name = "rejected_reason", columnDefinition = "text")
    private String rejectedReason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParkingCardStatus status; 

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false)
    private VehicleType vehicleType;
    
    @ManyToOne
    @JoinColumn(name = "package_id", nullable = false)
    private ParkingPackage parkingPackage;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}