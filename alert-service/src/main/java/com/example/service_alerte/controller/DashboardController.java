package com.example.service_alerte.controller;

import com.example.service_alerte.model.AnalyticsSummary;
import com.example.service_alerte.model.DashboardSummary;
import com.example.service_alerte.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsSummary> getAnalytics() {
        return ResponseEntity.ok(dashboardService.getAnalyticsSummary());
    }
}
