package movie.swp391.controller;

import lombok.RequiredArgsConstructor;
import movie.swp391.response.PermissionResponse;
import movie.swp391.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {
    private final PermissionService permissionService;
    @GetMapping
    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_PERMISSION')")
    public ResponseEntity<List<PermissionResponse>> getAll() {
        return ResponseEntity.ok(permissionService.getAll());
    }
} 