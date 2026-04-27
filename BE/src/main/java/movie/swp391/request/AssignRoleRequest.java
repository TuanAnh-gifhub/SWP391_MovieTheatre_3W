package movie.swp391.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignRoleRequest {
    @NotNull(message = "Account ID is required")
    private Integer accountId;
    
    @NotNull(message = "Role ID is required")
    private Integer roleId;
} 