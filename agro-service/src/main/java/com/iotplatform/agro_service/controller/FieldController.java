package com.iotplatform.agro_service.controller;

import com.iotplatform.agro_service.dto.CreateFieldRequest;
import com.iotplatform.agro_service.dto.FieldResponse;
import com.iotplatform.agro_service.dto.UpdateFieldRequest;
import com.iotplatform.agro_service.security.RoleAccess;
import com.iotplatform.agro_service.service.FieldService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/agro/fields")
@RequiredArgsConstructor
public class FieldController {

    private final FieldService fieldService;

    @PostMapping
    public ResponseEntity<FieldResponse> createField(HttpServletRequest httpRequest,
                                                     @Valid @RequestBody CreateFieldRequest createRequest) {
        RoleAccess.requireManagerOrAdmin(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(fieldService.createField(createRequest));
    }

    @GetMapping
    public ResponseEntity<List<FieldResponse>> getFields(@RequestParam UUID organizationId,
                                                         @RequestParam(required = false) UUID farmId) {
        return ResponseEntity.ok(fieldService.getFields(organizationId, farmId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FieldResponse> getField(@PathVariable UUID id, @RequestParam UUID organizationId) {
        return ResponseEntity.ok(fieldService.getField(organizationId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FieldResponse> updateField(@PathVariable UUID id,
                                                     HttpServletRequest httpRequest,
                                                     @RequestParam UUID organizationId,
                                                     @Valid @RequestBody UpdateFieldRequest updateRequest) {
        RoleAccess.requireManagerOrAdmin(httpRequest);
        return ResponseEntity.ok(fieldService.updateField(organizationId, id, updateRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteField(@PathVariable UUID id,
                                            HttpServletRequest httpRequest,
                                            @RequestParam UUID organizationId) {
        RoleAccess.requireManagerOrAdmin(httpRequest);
        fieldService.deleteField(organizationId, id);
        return ResponseEntity.noContent().build();
    }
}
