package movie.swp391.controller;

import lombok.RequiredArgsConstructor;
import movie.swp391.request.RoleRequest;
import movie.swp391.response.RoleResponse;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService roleService;

    @PostMapping("/add")
    public ResponseEntity<BaseResponse<RoleResponse>> addRole(@RequestBody RoleRequest request) {
        return ResponseEntity.ok(roleService.createRole(request));
    }

    @PutMapping("/update/{roleId}")
    public ResponseEntity<BaseResponse<RoleResponse>> updateRole(@PathVariable Integer roleId, @RequestBody RoleRequest request) {
        return ResponseEntity.ok(roleService.updateRole(roleId, request));
    }

    @DeleteMapping("/delete/{roleId}")
    public ResponseEntity<BaseResponse<Void>> deleteRole(@PathVariable Integer roleId) {
        return ResponseEntity.ok(roleService.deleteRole(roleId));
    }
}