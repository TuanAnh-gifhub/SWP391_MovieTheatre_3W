package movie.swp391.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatSelectionResponse {
    private String cinemaRoom;
    private List<SeatInfo> seats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatInfo {
        private String seatName;
        private String seatType;
        private Boolean isAvailable;
        private Double price;
        private String row;
        private Integer column;
        private String status;
    }
}
