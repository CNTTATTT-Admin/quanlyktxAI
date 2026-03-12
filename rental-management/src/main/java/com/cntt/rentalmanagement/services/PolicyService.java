package com.cntt.rentalmanagement.services;

import com.cntt.rentalmanagement.domain.models.Policy;
import org.springframework.data.domain.Page;

import java.util.List;

public interface PolicyService {
    Page<Policy> getAllPolicies(Integer pageNo, Integer pageSize);
    Policy getPolicyById(Long id);
    Policy getActivePolicy();
    Policy createPolicy(Policy policy);
    Policy updatePolicy(Long id, Policy policy);
    void deletePolicy(Long id);
}
