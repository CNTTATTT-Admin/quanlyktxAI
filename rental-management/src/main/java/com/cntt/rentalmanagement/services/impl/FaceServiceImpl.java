package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.enums.CheckType;
import com.cntt.rentalmanagement.domain.models.CheckInOutLog;
import com.cntt.rentalmanagement.domain.models.User;
import com.cntt.rentalmanagement.exception.BadRequestException;
import com.cntt.rentalmanagement.repository.CheckInOutLogRepository;
import com.cntt.rentalmanagement.repository.UserRepository;
import com.cntt.rentalmanagement.services.FaceService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FaceServiceImpl implements FaceService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CheckInOutLogRepository checkInOutLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private static final double THRESHOLD = 0.5;

    @Override
    @Transactional
    public void registerFace(Long userId, List<Double> faceVector) {
        User existingUser = recognizeUserByFace(faceVector);
        if (existingUser != null && !existingUser.getId().equals(userId)) {
            throw new BadRequestException("Khuôn mặt này đã được đăng ký bởi một tài khoản khác.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            String vectorJson = objectMapper.writeValueAsString(faceVector);
            user.setFaceVector(vectorJson);
            userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Error saving face vector", e);
        }
    }

    @Override
    public boolean verifyFace(Long userId, List<Double> faceVector) {
        if (userId == null) return false;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return verifyFace(user, faceVector);
    }

    @Override
    public boolean verifyFace(User user, List<Double> faceVector) {
        if (user == null || user.getFaceVector() == null) {
            return false;
        }

        try {
            List<Double> storedVector = objectMapper.readValue(user.getFaceVector(), new TypeReference<List<Double>>() {});
            double distance = calculateDistance(faceVector, storedVector);
            return distance < THRESHOLD;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional
    public void logCheckInOut(List<Double> faceVector, CheckType type) {
        User user = recognizeUserByFace(faceVector);

        if (user == null) {
            throw new BadRequestException("Không thể nhận diện khuôn mặt. Vui lòng thử lại hoặc đăng ký khuôn mặt.");
        }

        CheckInOutLog log = new CheckInOutLog();
        log.setUser(user);
        log.setCheckType(type == CheckType.CHECK_IN ? CheckType.CHECK_IN : CheckType.CHECK_OUT);
        log.setCheckTime(LocalDateTime.now());
        log.setSuccess(true);
        // Simple confidence based on distance (this is indicative)
        log.setConfidence(0.95);

        checkInOutLogRepository.save(log);
    }

    @Override
    public double calculateDistance(List<Double> v1, List<Double> v2) {
        if (v1.size() != v2.size()) {
            throw new IllegalArgumentException("Vectors must have same size");
        }
        double sum = 0;
        for (int i = 0; i < v1.size(); i++) {
            sum += Math.pow(v1.get(i) - v2.get(i), 2);
        }
        return Math.sqrt(sum);
    }

    @Override
    public User recognizeUserByFace(List<Double> faceVector) {
        List<User> users = userRepository.findAllByFaceVectorIsNotNull();
        for (User user : users) {
            String storedJson = user.getFaceVector();
            if (storedJson != null && !storedJson.isEmpty()) {
                try {
                    List<Double> storedVector = objectMapper.readValue(storedJson, 
                        objectMapper.getTypeFactory().constructCollectionType(List.class, Double.class));
                    
                    if (calculateDistance(faceVector, storedVector) < THRESHOLD) {
                        return user;
                    }
                } catch (Exception e) {
                    // Log error and continue
                }
            }
        }
        return null;
    }

    @Override
    public Page<CheckInOutLog> getCheckInOutLogs(int page, int size) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("checkTime").descending());
        return checkInOutLogRepository.findByUser(user, pageable);
    }
}
