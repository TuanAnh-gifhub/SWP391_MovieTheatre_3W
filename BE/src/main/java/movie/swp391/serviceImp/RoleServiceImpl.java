package movie.swp391.serviceImp;

import lombok.RequiredArgsConstructor;
import movie.swp391.entity.Role;
import movie.swp391.repository.RoleRepository;
import movie.swp391.request.RoleRequest;
import movie.swp391.response.RoleResponse;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.RoleService;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;

    private RoleResponse toRoleResponse(Role role) {
        RoleResponse res = new RoleResponse();
        res.setRoleId(role.getRoleID());
        res.setRoleName(role.getRoleName());
        res.setRoleCode(role.getRoleCode());
        res.setDescription(role.getDescription());
        return res;
    }

    @Override
    public BaseResponse<List<RoleResponse>> getAllRolesFull() {
        java.util.List<Role> roles = roleRepository.findAll();
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
        Role role = roleRepository.findById(roleId).orElse(null);
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
        Role role = roleRepository.findById(roleId).orElse(null);
        if (role == null) {
            return new BaseResponse<>("Role not found", false, null);
        }
        if (role.getAccounts() != null && !role.getAccounts().isEmpty()) {
            return new BaseResponse<>("Không thể xóa role đã gán cho user. Hãy chuyển user sang role khác trước!", false, null);
        }
        roleRepository.delete(role);
        return new BaseResponse<>("Xóa role thành công", true, null);
    }


}