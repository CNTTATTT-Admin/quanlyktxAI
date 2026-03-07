package com.cntt.rentalmanagement.domain.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Table(name = "banner")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_url")
    private String imageUrl;

    private String title;

    private String subtitle;

    @Column(name = "url")
    private String url;

    @Column(name = "button_text")
    private String buttonText;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "order_index")
    private Integer orderIndex;
}
