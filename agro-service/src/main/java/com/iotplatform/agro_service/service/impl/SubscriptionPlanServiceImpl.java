package com.iotplatform.agro_service.service.impl;

import com.iotplatform.agro_service.dto.CreateSubscriptionPlanRequest;
import com.iotplatform.agro_service.dto.SubscriptionPlanResponse;
import com.iotplatform.agro_service.dto.UpdateSubscriptionPlanRequest;
import com.iotplatform.agro_service.entity.SubscriptionPlan;
import com.iotplatform.agro_service.exception.ConflictException;
import com.iotplatform.agro_service.exception.ResourceNotFoundException;
import com.iotplatform.agro_service.mapper.SubscriptionPlanMapper;
import com.iotplatform.agro_service.repository.OrganizationRepository;
import com.iotplatform.agro_service.repository.SubscriptionPlanRepository;
import com.iotplatform.agro_service.service.SubscriptionPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionPlanServiceImpl implements SubscriptionPlanService {

    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final OrganizationRepository organizationRepository;
    private final SubscriptionPlanMapper subscriptionPlanMapper;

    @Override
    @Transactional
    public SubscriptionPlanResponse createSubscriptionPlan(CreateSubscriptionPlanRequest request) {
        String normalizedCode = normalizeCode(request.getCode());
        if (subscriptionPlanRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new ConflictException("Subscription plan code '%s' already exists".formatted(normalizedCode));
        }

        SubscriptionPlan subscriptionPlan = new SubscriptionPlan();
        applyRequest(subscriptionPlan, normalizedCode, request.getName(), request.getDescription(),
                request.getDeviceLimit(), request.getFieldLimit(), request.getPriceMonthly(), request.getActive());

        return subscriptionPlanMapper.toResponse(subscriptionPlanRepository.save(subscriptionPlan));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionPlanResponse> getSubscriptionPlans() {
        return subscriptionPlanRepository.findAllByOrderByNameAsc()
                .stream()
                .map(subscriptionPlanMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionPlanResponse getSubscriptionPlan(UUID id) {
        return subscriptionPlanMapper.toResponse(findSubscriptionPlan(id));
    }

    @Override
    @Transactional
    public SubscriptionPlanResponse updateSubscriptionPlan(UUID id, UpdateSubscriptionPlanRequest request) {
        SubscriptionPlan subscriptionPlan = findSubscriptionPlan(id);
        String normalizedCode = normalizeCode(request.getCode());
        if (subscriptionPlanRepository.existsByCodeIgnoreCaseAndIdNot(normalizedCode, id)) {
            throw new ConflictException("Subscription plan code '%s' already exists".formatted(normalizedCode));
        }

        applyRequest(subscriptionPlan, normalizedCode, request.getName(), request.getDescription(),
                request.getDeviceLimit(), request.getFieldLimit(), request.getPriceMonthly(), request.getActive());

        return subscriptionPlanMapper.toResponse(subscriptionPlanRepository.save(subscriptionPlan));
    }

    @Override
    @Transactional
    public void deleteSubscriptionPlan(UUID id) {
        SubscriptionPlan subscriptionPlan = findSubscriptionPlan(id);
        if (organizationRepository.existsBySubscriptionPlanId(id)) {
            throw new ConflictException("Subscription plan %s cannot be deleted while organizations still reference it".formatted(id));
        }

        subscriptionPlanRepository.delete(subscriptionPlan);
    }

    private SubscriptionPlan findSubscriptionPlan(UUID id) {
        return subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Subscription plan %s was not found".formatted(id)
                ));
    }

    private void applyRequest(SubscriptionPlan subscriptionPlan,
                              String code,
                              String name,
                              String description,
                              Integer deviceLimit,
                              Integer fieldLimit,
                              java.math.BigDecimal priceMonthly,
                              Boolean active) {
        subscriptionPlan.setCode(code);
        subscriptionPlan.setName(name.trim());
        subscriptionPlan.setDescription(description == null || description.isBlank() ? null : description.trim());
        subscriptionPlan.setDeviceLimit(deviceLimit);
        subscriptionPlan.setFieldLimit(fieldLimit);
        subscriptionPlan.setPriceMonthly(priceMonthly);
        subscriptionPlan.setActive(Boolean.TRUE.equals(active));
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase();
    }
}
