package com.cntt.rentalmanagement.domain.payload.request;

import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.Email;

@Getter
@Setter
public class SendEmailRequest {
    @Email
    private String toEmail;
    private String title;
    private String nameOfRentaler;
    private String description;
}
