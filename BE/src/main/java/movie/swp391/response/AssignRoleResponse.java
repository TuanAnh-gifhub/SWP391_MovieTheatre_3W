package movie.swp391.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignRoleResponse {
    private Integer accountId;
    private String username;
    private String previousRole;
    private String newRole;
    private String message;
    private boolean success;
} 