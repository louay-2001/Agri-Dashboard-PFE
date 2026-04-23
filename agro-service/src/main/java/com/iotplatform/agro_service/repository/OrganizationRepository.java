package com.iotplatform.agro_service.repository;

import com.iotplatform.agro_service.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    List<Organization> findAllByOrderByCreatedAtDesc();

    boolean existsBySubscriptionPlanId(UUID subscriptionPlanId);
}
