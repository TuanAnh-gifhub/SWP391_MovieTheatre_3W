package movie.swp391.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CinemaAdminResponse {
    private Integer cinemaId;
    private String name;
    private String address;
    private Integer cityId;
    private String city;
    private Integer totalRooms;
}

