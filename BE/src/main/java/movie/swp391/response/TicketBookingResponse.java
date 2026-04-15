package movie.swp391.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketBookingResponse {
    private Integer bookingId;
    private String movieTitle;
    private String poster;
    private LocalDate showDate;
    private LocalTime showTime;
    private String cinemaRoom;
    private List<SeatInfoResponse> seats;
    private Double totalPrice;
    private Integer convertedScore;
    private String status;
    private LocalDateTime bookingDate;
    private Integer customerId;
    private String city;
    private String cinemaName;
    private List<FoodAndDrinkInfo> foodAndDrinks;
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatInfoResponse {
        private Integer seatId;
        private String seatName;
        private String seatType;
        private String status;
        private Double price;
    }
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FoodAndDrinkInfo {
        private Integer id;
        private String name;
        private String type;
        private Double price;
        private String image;
        private Integer quantity;
    }
}
