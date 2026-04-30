package com.iotplatform.agro_service.controller;

import com.iotplatform.agro_service.dto.CreateOrganizationRequest;
import com.iotplatform.agro_service.dto.OrganizationResponse;
import com.iotplatform.agro_service.dto.PublicOrganizationResponse;
import com.iotplatform.agro_service.dto.UpdateOrganizationRequest;
import com.iotplatform.agro_service.security.RoleAccess;
import com.iotplatform.agro_service.service.OrganizationService;
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
@RequestMapping("/api/agro/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @PostMapping
    public ResponseEntity<OrganizationResponse> createOrganization(
            HttpServletRequest httpRequest,
            @Valid @RequestBody CreateOrganizationRequest createRequest) {
        RoleAccess.requireAdmin(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(organizationService.createOrganization(createRequest));
    }

    @GetMapping
    public ResponseEntity<List<OrganizationResponse>> getOrganizations() {
        return ResponseEntity.ok(organizationService.getOrganizations());
    }

    @GetMapping("/public")
    public ResponseEntity<List<PublicOrganizationResponse>> getPublicOrganizations() {
        return ResponseEntity.ok(organizationService.getPublicOrganizations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrganizationResponse> getOrganization(@PathVariable UUID id) {
        return ResponseEntity.ok(organizationService.getOrganization(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrganizationResponse> updateOrganization(@PathVariable UUID id,
                                                                   HttpServletRequest httpRequest,
                                                                   @Valid @RequestBody UpdateOrganizationRequest updateRequest) {
        RoleAccess.requireAdmin(httpRequest);
        return ResponseEntity.ok(organizationService.updateOrganization(id, updateRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrganization(@PathVariable UUID id, HttpServletRequest httpRequest) {
        RoleAccess.requireAdmin(httpRequest);
        organizationService.deleteOrganization(id);
        return ResponseEntity.noContent().build();
    }
}
