package movie.swp391.response;

import lombok.Data;

@Data
public class RoleResponse {
    private Integer roleId;
    private String roleName;
    private String roleCode;
    private String description;
    private java.util.Set<PermissionResponse> permissions;
}