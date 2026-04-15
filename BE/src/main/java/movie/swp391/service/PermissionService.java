package movie.swp391.service;


import movie.swp391.entity.Permission;
import movie.swp391.response.PermissionResponse;
import java.util.List;
import movie.swp391.entity.Role;
import java.util.Optional;

public interface PermissionService {
    PermissionResponse getById(Integer id);
    List<PermissionResponse> getAll();
    Optional<Role> getAdminRoleWithPermissions();
    PermissionResponse toResponse(Permission permission);
} 