package com.cntt.rentalmanagement.controller;

import com.cntt.rentalmanagement.domain.enums.RoleName;
import com.cntt.rentalmanagement.domain.payload.request.RoleRequest;
import com.cntt.rentalmanagement.domain.payload.request.SendEmailRequest;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.services.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.mail.MessagingException;
import java.io.IOException;
import java.util.Arrays;

@RestController
@RequestMapping("/account")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    private ResponseEntity<?> getAllAccount(@RequestParam(required = false) String keyword,
                                            @RequestParam Integer pageNo,
                                            @RequestParam Integer pageSize) {
        return ResponseEntity.ok(accountService.getAllAccount(keyword,pageNo,pageSize));
    }

    @GetMapping("/customer")
    private ResponseEntity<?> getAllAccountForCustomer(@RequestParam(required = false) String keyword,
                                            @RequestParam Integer pageNo,
                                            @RequestParam Integer pageSize) {
        return ResponseEntity.ok(accountService.getAllAccountByRole(keyword, Arrays.asList(RoleName.ROLE_RENTALER), pageNo, pageSize));
    }

    @GetMapping("/{id}")
    private ResponseEntity<?> getAccountById(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccountById(id));
    }

    @PostMapping("/send-email/{id}")
    private ResponseEntity<?> sendEmail(@PathVariable Long id, @RequestBody SendEmailRequest sendEmailRequest) {
        accountService.sendEmailForRentaler(id, sendEmailRequest);
        return ResponseEntity.ok(MessageResponse.builder().message("Gửi mail thành công").build());
    }

    @PostMapping("/send-mail/contact")
    private ResponseEntity<?> sendEmailForContact(@RequestBody SendEmailRequest sendEmailRequest) {
        accountService.sendEmailForRentaler(sendEmailRequest);
        return ResponseEntity.ok(MessageResponse.builder().message("Liện hệ đã được gửi thành công").build());
    }

    @PostMapping("/send-mail-rentaler")
    private ResponseEntity<?> sendEmailForRentaler(@RequestBody SendEmailRequest sendEmailRequest) {
        accountService.sendEmailOfCustomer(sendEmailRequest);
        return ResponseEntity.ok(MessageResponse.builder().message("Liên hệ thành công.").build());
    }


    @PostMapping("/{id}/authorization")
    private ResponseEntity<?> divideAuthorization(@PathVariable Long id, @RequestBody RoleRequest roleRequest) {
        return ResponseEntity.ok(accountService.divideAuthorization(id, roleRequest));
    }

    @DeleteMapping("/delete-multiple")
    private ResponseEntity<?> deleteMultipleAccounts(@RequestBody java.util.List<Long> ids) {
        accountService.deleteMultipleAccounts(ids);
        return ResponseEntity.ok(MessageResponse.builder().message("Xóa tài khoản thành công.").build());
    }
}
