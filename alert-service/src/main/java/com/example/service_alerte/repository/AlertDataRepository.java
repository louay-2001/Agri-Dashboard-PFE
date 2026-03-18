package com.example.service_alerte.repository;

import com.example.service_alerte.model.AlertData;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertDataRepository extends JpaRepository<AlertData, Long> {
}
