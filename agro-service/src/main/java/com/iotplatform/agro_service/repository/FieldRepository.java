package com.iotplatform.agro_service.repository;

import com.iotplatform.agro_service.entity.Field;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface FieldRepository extends JpaRepository<Field, UUID> {

    List<Field> findByFarmIdOrderByCreatedAtDesc(UUID farmId);

    List<Field> findByFarmIdInOrderByCreatedAtDesc(Collection<UUID> farmIds);

    boolean existsByFarmId(UUID farmId);
}
