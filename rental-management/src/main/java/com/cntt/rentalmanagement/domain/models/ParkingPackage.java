package com.cntt.rentalmanagement.domain.models;

import com.cntt.rentalmanagement.domain.enums.ParkingPackageStatus;
import com.cntt.rentalmanagement.domain.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "parking_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ParkingPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private Integer durationMonths;
    private String name;
    private BigDecimal price;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParkingPackageStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false)
    private VehicleType vehicleType;

    @ManyToOne
    @JoinColumn(name = "rentaler_id", nullable = false)
    private User rentaler;
}