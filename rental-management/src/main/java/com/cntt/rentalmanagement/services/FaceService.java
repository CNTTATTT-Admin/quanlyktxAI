package com.cntt.rentalmanagement.services;

import java.util.List;

import com.cntt.rentalmanagement.domain.enums.CheckType;
import com.cntt.rentalmanagement.domain.models.CheckInOutLog;
import com.cntt.rentalmanagement.domain.models.User;
import com.cntt.rentalmanagement.domain.payload.response.CheckInOutLogResponse;
import org.springframework.data.domain.Page;

public interface FaceService {
    void registerFace(Long userId, List<Double> faceVector);
    User recognizeUserByFace(List<Double> faceVector);
    boolean verifyFace(Long userId, List<Double> faceVector);
    boolean verifyFace(User user, List<Double> faceVector);
    void logCheckInOut(List<Double> faceVector, CheckType type);
    double calculateDistance(List<Double> v1, List<Double> v2);
    Page<CheckInOutLogResponse> getCheckInOutLogs(int page, int size);
    Page<CheckInOutLogResponse> getCheckInOutLogsForRentaler(Long rentalerId, Long roomId, int page, int size);
}
