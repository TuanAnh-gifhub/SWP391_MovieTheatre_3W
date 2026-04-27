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
public class TicketBookingByAdminResponse {
    private Integer bookingId;
    private String movieTitle;
    private LocalDate showDate;
    private LocalTime showTime;
    private String cinemaRoom;
    private String version; // 2D, 3D, IMAX
    private List<SeatResponse> seats;
    private Double totalPrice;
    private Integer convertedScore;
    private String status;
    private LocalDateTime bookingDate;
    private Integer customerId;
} 