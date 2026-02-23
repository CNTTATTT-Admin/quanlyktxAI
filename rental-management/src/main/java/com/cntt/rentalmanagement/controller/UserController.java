package com.cntt.rentalmanagement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.cntt.rentalmanagement.domain.models.User;
import com.cntt.rentalmanagement.exception.ResourceNotFoundException;
import com.cntt.rentalmanagement.repository.UserRepository;
import com.cntt.rentalmanagement.secruity.CurrentUser;
import com.cntt.rentalmanagement.secruity.UserPrincipal;
import com.cntt.rentalmanagement.services.impl.FileStorageServiceImpl;
import com.cntt.rentalmanagement.services.impl.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class UserController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FileStorageServiceImpl fileStorageServiceImpl;
    
    @Autowired
    private UserServiceImpl userServiceImpl;

    @GetMapping("/user/me")
    @PreAuthorize("hasRole('USER')")
    public User getCurrentUser(@CurrentUser UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
    }

    @GetMapping("/rentaler/me")
    @PreAuthorize("hasRole('RENTALER')")
    public User getRecruiter(@CurrentUser UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
    }

    @GetMapping("/admin/me")
    @PreAuthorize("hasRole('ADMIN')")
    public User getAdmin(@CurrentUser UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
    }
    

    @PostMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateImage(@CurrentUser UserPrincipal userPrincipal, @ModelAttribute MultipartFile image){
    	String path = fileStorageServiceImpl.storeFile(image);
        String result = userServiceImpl.updateImageUser(userPrincipal.getId(), path);
        return new ResponseEntity<String>(result, result.equals("Cập nhật hình ảnh thất bại!!!") == true ? HttpStatus.BAD_REQUEST : HttpStatus.OK);
    }
    
    @PutMapping("/user/update")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateInforUser(@CurrentUser UserPrincipal userPrincipal, @RequestBody User user){
    	String result = userServiceImpl.updateUser(user);
    	System.out.println(user.getEmail());
    	System.out.println(user.getName());
    	System.out.println(result);
        return new ResponseEntity<String>(result, result.equals("Cập nhật thông tin thành công!!!")? HttpStatus.OK : HttpStatus.BAD_GATEWAY);
    } 
}
