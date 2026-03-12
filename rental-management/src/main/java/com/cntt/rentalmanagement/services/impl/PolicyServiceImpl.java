package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.domain.models.Policy;
import com.cntt.rentalmanagement.exception.BadRequestException;
import com.cntt.rentalmanagement.repository.PolicyRepository;
import com.cntt.rentalmanagement.services.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PolicyServiceImpl implements PolicyService {

    private final PolicyRepository policyRepository;
    private static final Long SINGLE_POLICY_ID = 1L;

    @Override
    public Page<Policy> getAllPolicies(Integer pageNo, Integer pageSize) {
        // Not used anymore in simplified mode, but keeping interface compatibility for a moment
        return policyRepository.findAll(PageRequest.of(0, 1));
    }

    @Override
    public Policy getPolicyById(Long id) {
        return getActivePolicy();
    }

    @Override
    public Policy getActivePolicy() {
        return policyRepository.findById(SINGLE_POLICY_ID)
                .orElseGet(() -> {
                    Policy newPolicy = new Policy();
                    newPolicy.setId(SINGLE_POLICY_ID);
                    newPolicy.setTitle("Nội quy chung");
                    newPolicy.setContent("Nội dung nội quy chưa được thiết lập.");
                    newPolicy.setIsActive(true);
                    return policyRepository.save(newPolicy);
                });
    }

    @Override
    public Policy createPolicy(Policy policy) {
        Policy existing = getActivePolicy();
        existing.setContent(policy.getContent());
        existing.setTitle(policy.getTitle());
        return policyRepository.save(existing);
    }

    @Override
    public Policy updatePolicy(Long id, Policy policy) {
        return createPolicy(policy);
    }

    @Override
    public void deletePolicy(Long id) {
        // Do nothing or reset to default
        Policy existing = getActivePolicy();
        existing.setContent("Nội dung nội quy đã bị xóa.");
        policyRepository.save(existing);
    }
}
