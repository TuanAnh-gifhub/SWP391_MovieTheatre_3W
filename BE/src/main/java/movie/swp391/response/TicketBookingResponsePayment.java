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
public class TicketBookingResponsePayment {
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
    private String payment;
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatInfoResponse {
        private String seatName;
        private String seatType;
        private Double price;
    }
}
