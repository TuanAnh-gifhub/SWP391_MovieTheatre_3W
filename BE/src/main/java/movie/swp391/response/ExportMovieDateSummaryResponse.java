package movie.swp391.response;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExportMovieDateSummaryResponse {
    private Integer movieId;
    private String movieTitle;
    private LocalDate exportDate;
    private Double totalMoney;
    private Double totalMoneyWithoutFoodAndDiscount;
    private Double totalMoneyDiscount;
    private Double totalMoneyFood;
    private Double seller;
    private Double buyByScore;
}
