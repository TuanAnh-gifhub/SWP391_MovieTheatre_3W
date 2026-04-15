package movie.swp391.serviceImp;

import lombok.RequiredArgsConstructor;
import movie.swp391.entity.Role;
import movie.swp391.repository.RoleRepository;
import movie.swp391.request.RoleRequest;
import movie.swp391.request.AddPermissionToRoleRequest;
import movie.swp391.request.RemovePermissionFromRoleRequest;
import movie.swp391.response.RoleResponse;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.RoleService;
import org.springframework.stereotype.Service;
import movie.swp391.repository.PermissionRepository;
import movie.swp391.entity.Permission;
import movie.swp391.response.PermissionResponse;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    private RoleResponse toRoleResponse(Role role) {
        RoleResponse res = new RoleResponse();
        res.setRoleId(role.getRoleID());
        res.setRoleName(role.getRoleName());
        res.setRoleCode(role.getRoleCode());
        res.setDescription(role.getDescription());
        if (role.getPermissions() != null) {
            Set<PermissionResponse> permissionResponses = role.getPermissions().stream()
                .map(this::toPermissionResponse)
                .collect(Collectors.toSet());
            res.setPermissions(permissionResponses);
        }
        return res;
    }

    private PermissionResponse toPermissionResponse(Permission permission) {
        PermissionResponse response = new PermissionResponse();
        response.setId(permission.getId());
        response.setCode(permission.getCode());
        response.setDescription(permission.getDescription());
        response.setCreatedAt(permission.getCreatedAt());
        response.setUpdatedAt(permission.getUpdatedAt());
        return response;
    }

    @Override
    public BaseResponse<List<RoleResponse>> getAllRolesFull() {
        java.util.List<Role> roles = roleRepository.findAllWithPermissions();
        java.util.List<RoleResponse> roleResponses = roles.stream()
                .map(this::toRoleResponse)
                .collect(Collectors.toList());
        return new BaseResponse<>("Roles retrieved successfully", true, roleResponses);
    }

    @Override
    public BaseResponse<RoleResponse> createRole(RoleRequest req) {
        if (req.getRoleName() == null || req.getRoleName().trim().isEmpty() ||
                req.getRoleCode() == null || req.getRoleCode().trim().isEmpty() ||
                req.getDescription() == null || req.getDescription().trim().isEmpty()) {
            return new BaseResponse<>("Vui lòng nhập đầy đủ các trường bắt buộc", false, null);
        }
        if (roleRepository.existsByRoleName(req.getRoleName())) {
            return new BaseResponse<>("Tên role đã tồn tại", false, null);
        }
        if (roleRepository.existsByRoleCode(req.getRoleCode())) {
            return new BaseResponse<>("Mã role đã tồn tại", false, null);
        }
        Role role = new Role();
        role.setRoleName(req.getRoleName());
        role.setRoleCode(req.getRoleCode());
        role.setDescription(req.getDescription());
        Role saved = roleRepository.save(role);
        return new BaseResponse<>("Tạo role thành công", true, toRoleResponse(saved));
    }

    @Override
    public BaseResponse<RoleResponse> updateRole(Integer roleId, RoleRequest req) {
        Role role = roleRepository.findByIdWithPermissions(roleId).orElse(null);
        if (role == null) {
            return new BaseResponse<>("Role not found", false, null);
        }
        if (!role.getRoleName().equals(req.getRoleName()) && roleRepository.existsByRoleName(req.getRoleName())) {
            return new BaseResponse<>("Tên role đã tồn tại", false, null);
        }
        if (!role.getRoleCode().equals(req.getRoleCode()) && roleRepository.existsByRoleCode(req.getRoleCode())) {
            return new BaseResponse<>("Mã role đã tồn tại", false, null);
        }
        role.setRoleName(req.getRoleName());
        role.setRoleCode(req.getRoleCode());
        role.setDescription(req.getDescription());
        // Không cập nhật permissions ở đây nữa
        Role saved = roleRepository.save(role);
        return new BaseResponse<>("Cập nhật role thành công", true, toRoleResponse(saved));
    }

    @Override
    public BaseResponse<Void> deleteRole(Integer roleId) {
        Role role = roleRepository.findByIdWithPermissions(roleId).orElse(null);
        if (role == null) {
            return new BaseResponse<>("Role not found", false, null);
        }
        if (role.getAccounts() != null && !role.getAccounts().isEmpty()) {
            return new BaseResponse<>("Không thể xóa role đã gán cho user. Hãy chuyển user sang role khác trước!", false, null);
        }
        roleRepository.delete(role);
        return new BaseResponse<>("Xóa role thành công", true, null);
    }

    @Override
    public BaseResponse<RoleResponse> addPermissionsToRole(AddPermissionToRoleRequest request) {
        Role role = roleRepository.findByIdWithPermissions(request.getRoleId()).orElse(null);
        if (role == null) {
            return new BaseResponse<>("Role not found", false, null);
        }

        // Kiểm tra permission đã tồn tại
        Set<Integer> existingPermissionIds = role.getPermissions().stream()
            .map(Permission::getId)
            .collect(Collectors.toSet());
        List<Integer> duplicated = request.getPermissionIds().stream()
            .filter(existingPermissionIds::contains)
            .collect(Collectors.toList());
        if (!duplicated.isEmpty()) {
            return new BaseResponse<>("Permission id(s) đã tồn tại trong role: " + duplicated, false, null);
        }

        Set<Permission> newPermissions = request.getPermissionIds().stream()
            .map(id -> permissionRepository.findById(id).orElse(null))
            .filter(java.util.Objects::nonNull)
            .collect(Collectors.toSet());

        if (newPermissions.isEmpty()) {
            return new BaseResponse<>("No valid permissions found", false, null);
        }

        // Thêm permissions mới vào set hiện tại (không xóa permissions cũ)
        role.getPermissions().addAll(newPermissions);
        Role savedRole = roleRepository.save(role);
        
        return new BaseResponse<>("Permissions added to role successfully", true, toRoleResponse(savedRole));
    }

    @Override
    public BaseResponse<RoleResponse> removePermissionsFromRole(RemovePermissionFromRoleRequest request) {
        Role role = roleRepository.findByIdWithPermissions(request.getRoleId()).orElse(null);
        if (role == null) {
            return new BaseResponse<>("Role not found", false, null);
        }

        Set<Integer> existingPermissionIds = role.getPermissions().stream()
            .map(Permission::getId)
            .collect(Collectors.toSet());
        List<Integer> notFound = request.getPermissionIds().stream()
            .filter(id -> !existingPermissionIds.contains(id))
            .collect(Collectors.toList());
        if (!notFound.isEmpty()) {
            return new BaseResponse<>("Permission id(s) không tồn tại trong role: " + notFound, false, null);
        }

        Set<Permission> permissionsToRemove = request.getPermissionIds().stream()
            .map(id -> permissionRepository.findById(id).orElse(null))
            .filter(java.util.Objects::nonNull)
            .collect(Collectors.toSet());

        if (permissionsToRemove.isEmpty()) {
            return new BaseResponse<>("No valid permissions found to remove", false, null);
        }

        // Xóa permissions khỏi set hiện tại
        role.getPermissions().removeAll(permissionsToRemove);
        Role savedRole = roleRepository.save(role);
        
        return new BaseResponse<>("Permissions removed from role successfully", true, toRoleResponse(savedRole));
    }
}