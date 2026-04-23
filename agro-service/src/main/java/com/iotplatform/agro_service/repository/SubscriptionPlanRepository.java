package com.iotplatform.agro_service.repository;

import com.iotplatform.agro_service.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, UUID> {

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, UUID id);

    List<SubscriptionPlan> findAllByOrderByNameAsc();

    Optional<SubscriptionPlan> findByCodeIgnoreCase(String code);
}
