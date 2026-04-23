package com.iotplatform.agro_service.repository;

import com.iotplatform.agro_service.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FarmRepository extends JpaRepository<Farm, UUID> {

    List<Farm> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);

    Optional<Farm> findByIdAndOrganizationId(UUID id, UUID organizationId);

    boolean existsByOrganizationId(UUID organizationId);

    @Query("select farm.id from Farm farm where farm.organizationId = :organizationId")
    List<UUID> findIdsByOrganizationId(@Param("organizationId") UUID organizationId);
}
