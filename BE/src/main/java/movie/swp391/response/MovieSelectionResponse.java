package movie.swp391.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieSelectionResponse {
    private Integer movieId;
    private String title;
    private String poster;
    private String version;
} 