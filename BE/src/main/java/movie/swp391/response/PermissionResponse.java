package movie.swp391.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PermissionResponse {
    private Integer id;
    private String code;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 