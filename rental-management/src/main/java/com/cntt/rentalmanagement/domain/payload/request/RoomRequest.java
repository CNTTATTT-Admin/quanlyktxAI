package com.cntt.rentalmanagement.domain.payload.request;

import com.cntt.rentalmanagement.domain.enums.RoomStatus;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomRequest {
    private String title;

    private String description;

    private BigDecimal price;

    private Double latitude;

    private Double longitude;

    private String address;

    private Long locationId;

    private Long categoryId;

    private RoomStatus status;

    private List<AssetRequest> assets;

    private List<MultipartFile> files;

    private BigDecimal internetCost;
    private Integer maxOccupancy;
    private Integer floor;

    private BigDecimal waterCost;
    private BigDecimal publicElectricCost;
}
