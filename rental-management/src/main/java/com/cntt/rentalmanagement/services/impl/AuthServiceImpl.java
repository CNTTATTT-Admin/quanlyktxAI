package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.enums.AuthProvider;
import com.cntt.rentalmanagement.domain.enums.RoleName;
import com.cntt.rentalmanagement.domain.models.Role;
import com.cntt.rentalmanagement.domain.models.User;
import com.cntt.rentalmanagement.domain.payload.request.*;
import com.cntt.rentalmanagement.domain.payload.response.MessageResponse;
import com.cntt.rentalmanagement.exception.BadRequestException;
import com.cntt.rentalmanagement.repository.RoleRepository;
import com.cntt.rentalmanagement.repository.UserRepository;
import com.cntt.rentalmanagement.secruity.TokenProvider;
import com.cntt.rentalmanagement.services.AuthService;
import com.cntt.rentalmanagement.services.BaseService;
import com.cntt.rentalmanagement.services.FileStorageService;
import com.cntt.rentalmanagement.services.MailService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.Collections;
import java.util.Objects;

@Service
public class AuthServiceImpl extends BaseService implements AuthService {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;


    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenProvider tokenProvider;

    @Autowired
    private MailService mailService;

    @Autowired
    private FileStorageService fileStorageService;


    @Override
    public URI registerAccount(SignUpRequest signUpRequest) throws MessagingException, IOException {
        System.out.println("DEBUG: Registering account for email: " + signUpRequest.getEmail());
        if(userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new BadRequestException("Email đã được sử dụng!!");
        }

        if (userRepository.findByPhone(signUpRequest.getPhone()).isPresent()) {
            throw new BadRequestException("Số điện thoại đã được sử dụng.");
        }

        if (!signUpRequest.getPassword().equals(signUpRequest.getConfirmPassword())) {
            throw new BadRequestException("Mật khẩu không khớp. Vui lòng thử lại.");
        }
        
        if (!signUpRequest.getEmail().endsWith("@gmail.com") && !signUpRequest.getEmail().endsWith("@yopmail.com")) {
            throw new BadRequestException("Định dạng email không hợp lệ. Vui lòng thử lại.");
        }

        // Creating user's account
        User user = new User();
        User result = null;
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(signUpRequest.getPassword());
        user.setProvider(AuthProvider.local);
        user.setIsLocked(false);
        user.setIsConfirmed(false);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        System.out.println("DEBUG: Encoded password for " + user.getEmail());
        mailService.sendEmailConfirmed(signUpRequest.getEmail(),signUpRequest.getName());

        if (RoleName.ROLE_USER.equals(signUpRequest.getRole())) {
            Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                    .orElseThrow(() -> new IllegalArgumentException("User Role not set."));
            user.setPhone(signUpRequest.getPhone());
            user.setRoles(Collections.singleton(userRole));
            result = userRepository.save(user);

        } else if(RoleName.ROLE_RENTALER.equals(signUpRequest.getRole())){
            Role userRole = roleRepository.findByName(RoleName.ROLE_RENTALER)
                    .orElseThrow(() -> new IllegalArgumentException("User Role not set."));
            user.setAddress(signUpRequest.getAddress());
            user.setPhone(signUpRequest.getPhone());
            user.setRoles(Collections.singleton(userRole));
            result = userRepository.save(user);
        } else {
            throw new IllegalArgumentException("Bạn không có quyền tạo tài khoản!!!!");
        }
        
        System.out.println("DEBUG: User saved successfully: " + result.getEmail());

        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath().path("/user/me")
                .buildAndExpand(result.getId()).toUri();
        return location;
    }

    @Override
    public String login(LoginRequest loginRequest) {
        System.out.println("DEBUG: Login attempt for email: " + loginRequest.getEmail());
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            System.out.println("DEBUG: Authentication successful for email: " + loginRequest.getEmail());

            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại."));

            if (user.getIsConfirmed() == null || !user.getIsConfirmed()) {
                throw new BadRequestException("Tài khoản của bạn chưa được xác nhận. Vui lòng kiểm tra email để xác nhận tài khoản.");
            }

            SecurityContextHolder.getContext().setAuthentication(authentication);
            return tokenProvider.createToken(authentication);
        } catch (Exception e) {
            System.out.println("DEBUG: Authentication failed for email: " + loginRequest.getEmail() + " | Error: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public MessageResponse forgotPassword(EmailRequest emailRequest) throws MessagingException, IOException {
        userRepository.findByEmail(emailRequest.getEmail()).orElseThrow(() -> new BadRequestException("Email này không tồn tại."));
        mailService.sendEmailFromTemplate(emailRequest.getEmail());
        return MessageResponse.builder().message("Gửi yêu cầu thành công.").build();
    }

    @Override
    public MessageResponse resetPassword(ResetPasswordRequest resetPasswordRequest) {
        if (!resetPasswordRequest.getPassword().equals(resetPasswordRequest.getConfirmedPassword())) {
            throw new BadRequestException("Mật khẩu không trùng khớp.");
        }
        User user = userRepository.findByEmail(resetPasswordRequest.getEmail()).orElseThrow(() -> new BadRequestException("Email này không tồn tại."));
        user.setPassword(resetPasswordRequest.getPassword());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return MessageResponse.builder().message("Thay đổi mật khẩu mới thành công").build();
    }

    @Override
    public MessageResponse confirmedAccount(EmailRequest emailRequest) {
        User user = userRepository.findByEmail(emailRequest.getEmail()).orElseThrow(() -> new BadRequestException("Email này không tồn tại."));
        user.setIsConfirmed(true);
        userRepository.save(user);
        return MessageResponse.builder().message("Tài khoản đã được xác thực. Vui lòng đăng nhập").build();
    }

    @Override
    public MessageResponse changePassword(ChangePasswordRequest changePasswordRequest) {
        User user = userRepository.findById(getUserId()).orElseThrow(() -> new BadRequestException("Tài khoảng không tồn tại"));
        boolean passwordMatch = BCrypt.checkpw(changePasswordRequest.getOldPassword(), user.getPassword());
        if (!passwordMatch) {
            throw new BadRequestException("Mật khẩu cũ không chính xác");
        }
        if (!changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmPassword())) {
            throw new BadRequestException("Mật khẩu không trùng khớp");
        }

        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);
        return MessageResponse.builder().message("Cập nhật mật khẩu thành công").build();
    }

    @Override
    public MessageResponse changeImage(MultipartFile file) {
        User user = userRepository.findById(getUserId()).orElseThrow(() -> new BadRequestException("Tài khoảng không tồn tại"));
        if (Objects.nonNull(file)) {
            String image = fileStorageService.storeFile(file).replace("photographer/files/", "");
            user.setImageUrl("http://localhost:8080/image/" + image);
        }
        userRepository.save(user);
        return MessageResponse.builder().message("Thay ảnh đại diện thành công.").build();
    }

    @Override
    public MessageResponse lockAccount(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setIsLocked(true);
        userRepository.save(user);
        return MessageResponse.builder().message("Đã khóa tài khoản thành công").build();
    }

    @Override
    public MessageResponse unlockAccount(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setIsLocked(false);
        userRepository.save(user);
        return MessageResponse.builder().message("Đã mở khóa tài khoản thành công").build();
    }

    @Override
    public MessageResponse uploadProfile(MultipartFile file, String zalo, String facebook, String address, String phone) {
        User user = userRepository.findById(getUserId()).orElseThrow(() -> new BadRequestException("Tài khoảng không tồn tại"));
        user.setZaloUrl(zalo);
        user.setFacebookUrl(facebook);
        user.setAddress(address);
        if (phone != null && !phone.isBlank()) {
            // Check if phone is already used by another user
            userRepository.findByPhone(phone).ifPresent(existing -> {
                if (!existing.getId().equals(getUserId())) {
                    throw new BadRequestException("Số điện thoại này đã được sử dụng bởi tài khoản khác.");
                }
            });
            user.setPhone(phone);
        }
        if (Objects.nonNull(file)) {
            String image = fileStorageService.storeFile(file).replace("photographer/files/", "");
            user.setImageUrl("http://localhost:8080/image/" + image);
        }
        userRepository.save(user);
        return MessageResponse.builder().message("Thay thông tin cá nhân thành công.").build();
    }


    @Override
    public String faceLogin(User user) {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                null,
                Collections.emptyList()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return tokenProvider.createToken(authentication);
    }
}

