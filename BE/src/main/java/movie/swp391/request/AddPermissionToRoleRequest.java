package movie.swp391.request;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class AddPermissionToRoleRequest {
    @NotNull(message = "Role ID is required")
    private Integer roleId;
    
    @NotNull(message = "Permission IDs are required")
    private List<Integer> permissionIds;
} 