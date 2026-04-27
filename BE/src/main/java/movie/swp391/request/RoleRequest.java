package movie.swp391.request;

import lombok.Data;

@Data
public class RoleRequest {
    private String roleName;
    private String roleCode;
    private String description;
}