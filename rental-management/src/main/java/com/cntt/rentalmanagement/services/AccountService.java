package com.cntt.rentalmanagement.services;

import com.cntt.rentalmanagement.domain.enums.RoleName;
import com.cntt.rentalmanagement.domain.models.User;
import com.cntt.rentalmanagement.domain.payload.request.RoleRequest;
import com.cntt.rentalmanagement.domain.payload.request.SendEmailRequest;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.domain.payload.response.UserResponse;
import org.springframework.data.domain.Page;

import jakarta.mail.MessagingException;
import java.io.IOException;
import java.util.List;

public interface AccountService {

    Page<User> getAllAccount(String keyword, Integer pageNo, Integer pageSize);

    Page<User> getAllAccountByRole(String keyword, List<RoleName> roles, Integer pageNo, Integer pageSize);

    User getAccountById(Long id);

    void sendEmailForRentaler(Long id, SendEmailRequest sendEmailRequest);

    MessageResponse divideAuthorization(Long id, RoleRequest roleRequest);

    void sendEmailForRentaler(SendEmailRequest sendEmailRequest);

    void sendEmailOfCustomer(SendEmailRequest sendEmailRequest);
}
