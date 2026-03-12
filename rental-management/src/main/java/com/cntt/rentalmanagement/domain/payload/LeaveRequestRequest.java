package com.cntt.rentalmanagement.domain.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestRequest {
    @NotBlank
    private String reason;

    @NotNull
    private LocalDateTime startDate;

    @NotNull
    private LocalDateTime endDate;
    
    private String status;
}
