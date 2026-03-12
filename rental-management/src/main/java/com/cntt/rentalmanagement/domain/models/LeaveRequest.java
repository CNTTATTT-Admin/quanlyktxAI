package com.cntt.rentalmanagement.domain.models;

import com.cntt.rentalmanagement.domain.enums.LeaveStatus;
import com.cntt.rentalmanagement.domain.models.audit.DateAudit;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequest extends DateAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String reason;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    private LeaveStatus status;

    public LeaveRequest(User user, String reason, LocalDateTime startDate, LocalDateTime endDate, LeaveStatus status) {
        this.user = user;
        this.reason = reason;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }
}
