package com.cntt.rentalmanagement.domain.payload.response;

import com.cntt.rentalmanagement.domain.enums.CheckType;
import com.cntt.rentalmanagement.domain.models.CheckInOutLog;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CheckInOutLogResponse {
    private Long id;
    private String userName;
    private String userEmail;
    private String roomTitle;
    private CheckType checkType;
    private LocalDateTime checkTime;
    private Double confidence;
    private Boolean success;

    public CheckInOutLogResponse(CheckInOutLog log) {
        this.id = log.getId();
        if (log.getUser() != null) {
            this.userName = log.getUser().getName();
            this.userEmail = log.getUser().getEmail();
            if (log.getUser().getAllocatedRoom() != null) {
                this.roomTitle = log.getUser().getAllocatedRoom().getTitle();
            }
        }
        this.checkType = log.getCheckType();
        this.checkTime = log.getCheckTime();
        this.confidence = log.getConfidence();
        this.success = log.getSuccess();
    }
}
