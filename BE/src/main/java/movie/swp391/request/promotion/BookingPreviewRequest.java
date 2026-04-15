package movie.swp391.request.promotion;

import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
public class BookingPreviewRequest {
    private Integer customerId;
    private Integer movieId;
    private Integer cinemaRoomId;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate showDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
    private LocalTime showTime;

    private List<Integer> seatIds;
}
