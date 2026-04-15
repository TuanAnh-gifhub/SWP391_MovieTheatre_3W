package movie.swp391.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesSummaryResponse {
    private String timeSlot;
    private String category;
    private int orderVolume;
    private double revenue;
}