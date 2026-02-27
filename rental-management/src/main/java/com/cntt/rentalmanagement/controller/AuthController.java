package com.cntt.rentalmanagement.controller;

import com.cntt.rentalmanagement.domain.enums.CheckType;
import com.cntt.rentalmanagement.domain.models.User;
import com.cntt.rentalmanagement.domain.payload.request.*;
import com.cntt.rentalmanagement.domain.payload.response.ApiResponse;
import com.cntt.rentalmanagement.domain.payload.response.AuthResponse;
import com.cntt.rentalmanagement.services.AuthService;
import com.cntt.rentalmanagement.services.FaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;
import javax.mail.MessagingException;
import javax.validation.Valid;
import java.io.IOException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private FaceService faceService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(new AuthResponse(authService.login(loginRequest)));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) throws MessagingException, IOException {
        return ResponseEntity.created(authService.registerAccount(signUpRequest))
                .body(new ApiResponse(true, "User registered successfully@"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody EmailRequest emailRequest) throws MessagingException, IOException {
        return ResponseEntity.ok(authService.forgotPassword(emailRequest));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest resetPasswordRequest) {
        return ResponseEntity.ok(authService.resetPassword(resetPasswordRequest));
    }

    @PostMapping("/confirmed")
    public ResponseEntity<?> confirmedAccount(@RequestBody EmailRequest emailRequest){
        return ResponseEntity.ok(authService.confirmedAccount(emailRequest));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest changePasswordRequest) {
        return ResponseEntity.ok(authService.changePassword(changePasswordRequest));
    }

    @PostMapping("/upload-avatar")
    public  ResponseEntity<?> changeImage(@RequestParam(required = false) MultipartFile file){
        return ResponseEntity.ok(authService.changeImage(file));
    }

    @PostMapping("/upload-profile")
    public ResponseEntity<?> changeImage(@RequestParam(required = false) MultipartFile file,
                                         @RequestParam(required = false) String zalo,
                                         @RequestParam(required = false) String facebook,
                                         @RequestParam(required = false) String address) {
        return ResponseEntity.ok(authService.uploadProfile(file, zalo, facebook, address));
    }


    @PostMapping("/{id}/locked")
    public ResponseEntity<?> lockedAccount(@PathVariable Long id) {
        return ResponseEntity.ok(authService.lockAccount(id));
    }

    @PostMapping("/unlock/{id}")
    public ResponseEntity<?> unlockAccount(@PathVariable Long id) {
        return ResponseEntity.ok(authService.unlockAccount(id));
    }

    @PostMapping("/face-check")
    public ResponseEntity<?> faceCheck(@RequestBody FaceRegisterRequest request, @RequestParam CheckType type) {
        faceService.logCheckInOut(request.getFaceVector(), type);
        return ResponseEntity.ok(new ApiResponse(true, type + " successful"));
    }

    @PostMapping("/face-register")
    public ResponseEntity<?> faceRegister(@RequestBody FaceRegisterRequest request) {
        faceService.registerFace(request.getUserId(), request.getFaceVector());
        return ResponseEntity.ok(new ApiResponse(true, "Face registered successfully"));
    }

    @GetMapping("/history")
    public ResponseEntity<?> faceCheckHistory(@RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(faceService.getCheckInOutLogs(page, size));
    }
}
