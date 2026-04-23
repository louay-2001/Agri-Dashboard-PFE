package com.iotplatform.agro_service.controller;

import com.iotplatform.agro_service.dto.CreateSubscriptionPlanRequest;
import com.iotplatform.agro_service.dto.SubscriptionPlanResponse;
import com.iotplatform.agro_service.dto.UpdateSubscriptionPlanRequest;
import com.iotplatform.agro_service.security.RoleAccess;
import com.iotplatform.agro_service.service.SubscriptionPlanService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/agro/subscription-plans")
@RequiredArgsConstructor
public class SubscriptionPlanController {

    private final SubscriptionPlanService subscriptionPlanService;

    @PostMapping
    public ResponseEntity<SubscriptionPlanResponse> createSubscriptionPlan(HttpServletRequest httpRequest,
                                                                           @Valid @RequestBody CreateSubscriptionPlanRequest request) {
        RoleAccess.requireAdmin(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(subscriptionPlanService.createSubscriptionPlan(request));
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionPlanResponse>> getSubscriptionPlans() {
        return ResponseEntity.ok(subscriptionPlanService.getSubscriptionPlans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionPlanResponse> getSubscriptionPlan(@PathVariable UUID id) {
        return ResponseEntity.ok(subscriptionPlanService.getSubscriptionPlan(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionPlanResponse> updateSubscriptionPlan(@PathVariable UUID id,
                                                                           HttpServletRequest httpRequest,
                                                                           @Valid @RequestBody UpdateSubscriptionPlanRequest request) {
        RoleAccess.requireAdmin(httpRequest);
        return ResponseEntity.ok(subscriptionPlanService.updateSubscriptionPlan(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubscriptionPlan(@PathVariable UUID id, HttpServletRequest httpRequest) {
        RoleAccess.requireAdmin(httpRequest);
        subscriptionPlanService.deleteSubscriptionPlan(id);
        return ResponseEntity.noContent().build();
    }
}
