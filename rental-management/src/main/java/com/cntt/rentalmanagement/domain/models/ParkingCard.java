package com.cntt.rentalmanagement.domain.models;

import com.cntt.rentalmanagement.domain.enums.ParkingCardStatus;
import com.cntt.rentalmanagement.domain.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String brandModel;
    private String color;
    private LocalDateTime expiryDate;
    private LocalDateTime issueDate;
    private String licensePlate;
    private String registrationImageUrl;
    private String rejectedReason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParkingCardStatus status; 

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false)
    private VehicleType vehicleType;
    
    @Column(name = "package_id")
    private Long packageId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}