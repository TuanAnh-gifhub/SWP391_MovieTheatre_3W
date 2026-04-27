package movie.swp391.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CinemaRoomResponse {
    private Integer cinemaRoomId;
    private String roomName;
    private Integer seatQuantity;
    private String address;
    private String name;
    private String city;
    private Integer cinemaId;
    private Boolean status;
}