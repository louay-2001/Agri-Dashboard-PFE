package com.iotplatform.agro_service.mapper;

import com.iotplatform.agro_service.dto.SubscriptionPlanResponse;
import com.iotplatform.agro_service.entity.SubscriptionPlan;
import org.springframework.stereotype.Component;

@Component
public class SubscriptionPlanMapper {

    public SubscriptionPlanResponse toResponse(SubscriptionPlan subscriptionPlan) {
        return SubscriptionPlanResponse.builder()
                .id(subscriptionPlan.getId())
                .code(subscriptionPlan.getCode())
                .name(subscriptionPlan.getName())
                .description(subscriptionPlan.getDescription())
                .deviceLimit(subscriptionPlan.getDeviceLimit())
                .fieldLimit(subscriptionPlan.getFieldLimit())
                .priceMonthly(subscriptionPlan.getPriceMonthly())
                .active(subscriptionPlan.isActive())
                .createdAt(subscriptionPlan.getCreatedAt())
                .build();
    }
}
