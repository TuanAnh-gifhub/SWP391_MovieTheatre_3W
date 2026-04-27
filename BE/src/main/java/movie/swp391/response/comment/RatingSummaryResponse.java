package movie.swp391.response.comment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RatingSummaryResponse {
    private Integer rating; // số sao: 5, 4, 3, 2, 1
    private Long count;     // số lượt đánh giá tương ứng
}
