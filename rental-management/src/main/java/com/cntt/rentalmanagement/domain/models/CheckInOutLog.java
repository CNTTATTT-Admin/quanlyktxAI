package com.cntt.rentalmanagement.domain.models;

import com.cntt.rentalmanagement.domain.enums.CheckType;
import com.cntt.rentalmanagement.domain.models.audit.DateAudit;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "check_in_out_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CheckInOutLog extends DateAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private CheckType checkType;

    private LocalDateTime checkTime;

    private Double confidence;

    private Boolean success;

    public CheckInOutLog(User user, CheckType checkType, LocalDateTime checkTime, Double confidence, Boolean success) {
        this.user = user;
        this.checkType = checkType;
        this.checkTime = checkTime;
        this.confidence = confidence;
        this.success = success;
    }
}
