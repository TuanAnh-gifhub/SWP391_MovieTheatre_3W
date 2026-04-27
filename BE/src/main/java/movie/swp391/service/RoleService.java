package movie.swp391.service;

import movie.swp391.request.RoleRequest;
import movie.swp391.response.RoleResponse;
import movie.swp391.response.common.BaseResponse;

import java.util.List;

public interface RoleService {
    BaseResponse<RoleResponse> createRole(RoleRequest request);
    BaseResponse<RoleResponse> updateRole(Integer roleId, RoleRequest request);
    BaseResponse<Void> deleteRole(Integer roleId);
    // Lấy tất cả roles
    BaseResponse<List<RoleResponse>> getAllRolesFull();
}