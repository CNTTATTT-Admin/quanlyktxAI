package com.cntt.rentalmanagement.services;

import com.cntt.rentalmanagement.domain.models.User;
import com.cntt.rentalmanagement.domain.payload.request.RoleRequest;
import com.cntt.rentalmanagement.domain.payload.request.SendEmailRequest;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.domain.payload.response.UserResponse;
import org.springframework.data.domain.Page;

import javax.mail.MessagingException;
import java.io.IOException;

public interface AccountService {

    Page<User> getAllAccount(String keyword, Integer pageNo, Integer pageSize);

    User getAccountById(Long id);

    void sendEmailForRentaler(Long id, SendEmailRequest sendEmailRequest);

    MessageResponse divideAuthorization(Long id, RoleRequest roleRequest);

    void sendEmailForRentaler(SendEmailRequest sendEmailRequest);

    void sendEmailOfCustomer(SendEmailRequest sendEmailRequest);
}
