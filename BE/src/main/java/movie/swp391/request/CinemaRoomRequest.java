package movie.swp391.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CinemaRoomRequest {

    private List<String> roomName;

    @NotNull(message = "Seat quantity is required")
    @Min(value = 1, message = "Seat quantity must be at least 1")
    private Integer seatQuantity;

    @NotNull(message = "Cinema ID is required")
    private Integer cinemaId;
} 