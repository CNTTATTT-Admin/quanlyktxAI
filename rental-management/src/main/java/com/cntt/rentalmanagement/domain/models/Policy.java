package com.cntt.rentalmanagement.domain.models;

import com.cntt.rentalmanagement.domain.models.audit.DateAudit;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Table(name = "policy")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Policy extends DateAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String title;

    @Column(name = "is_active")
    private Boolean isActive;
}
