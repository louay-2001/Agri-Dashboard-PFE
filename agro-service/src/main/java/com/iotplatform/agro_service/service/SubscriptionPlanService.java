package com.iotplatform.agro_service.service;

import com.iotplatform.agro_service.dto.CreateSubscriptionPlanRequest;
import com.iotplatform.agro_service.dto.SubscriptionPlanResponse;
import com.iotplatform.agro_service.dto.UpdateSubscriptionPlanRequest;

import java.util.List;
import java.util.UUID;

public interface SubscriptionPlanService {

    SubscriptionPlanResponse createSubscriptionPlan(CreateSubscriptionPlanRequest request);

    List<SubscriptionPlanResponse> getSubscriptionPlans();

    SubscriptionPlanResponse getSubscriptionPlan(UUID id);

    SubscriptionPlanResponse updateSubscriptionPlan(UUID id, UpdateSubscriptionPlanRequest request);

    void deleteSubscriptionPlan(UUID id);
}
