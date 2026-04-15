package movie.swp391.response.comment;

import lombok.Data;
import java.util.List;

@Data
public class RatingOverviewResponse {
    private Double averageRating;
    private Long totalRatingCount;
    private Long totalCommentCount;
    private List<RatingSummaryResponse> ratingSummary;

    public RatingOverviewResponse(Double averageRating, Long totalRatingCount,
                                  Long totalCommentCount, List<RatingSummaryResponse> ratingSummary) {
        this.averageRating = averageRating;
        this.totalRatingCount = totalRatingCount;
        this.totalCommentCount = totalCommentCount;
        this.ratingSummary = ratingSummary;
    }
}
