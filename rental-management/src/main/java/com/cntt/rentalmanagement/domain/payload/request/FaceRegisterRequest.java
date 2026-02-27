package com.cntt.rentalmanagement.domain.payload.request;

import lombok.Data;
import java.util.List;

@Data
public class FaceRegisterRequest {
    private Long userId;
    private List<Double> faceVector;
}
