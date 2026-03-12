package com.cntt.rentalmanagement.domain.payload.request;

import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.Email;

@Getter
@Setter
public class EmailRequest {

    @Email
    private String email;
}
