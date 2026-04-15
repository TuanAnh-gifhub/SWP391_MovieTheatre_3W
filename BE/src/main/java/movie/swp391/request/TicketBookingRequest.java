package movie.swp391.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketBookingRequest {
    private Integer customerId;
    private Integer movieId;
    private Integer cinemaRoomId;
    private LocalDate showDate;
    private LocalTime showTime;
    private List<Integer> seatIds;
    private List<String> seatNames;
    private List<Integer> promotionIds;
    private List<FoodAndDrinkOrderRequest> foodAndDrinks;
}