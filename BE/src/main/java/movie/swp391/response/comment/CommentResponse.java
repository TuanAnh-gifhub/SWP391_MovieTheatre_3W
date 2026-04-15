package movie.swp391.response.comment;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponse {
    private Integer id;
    private String content;
    private Integer rating;
    private String displayName;
    private boolean edited;
    private boolean hidden;
    private LocalDateTime createdAt;
    private  Integer customerId;
}


