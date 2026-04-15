package movie.swp391.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SeatFromCityresponse {
    private Integer cityID;

    String name;
    List<CinemaDTO> cinemas;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CinemaDTO {
        Integer cinemaID;
        String name;
        List<CinemaRoomDTO> cinemaRooms;
    }
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CinemaRoomDTO {
        Integer cinemaRoomID;
        String roomName;
        Integer seatQuantity;
        List<SeatDTO>  seats;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SeatDTO {
        Integer seatID;
        String seatName;
        String seatType;
         Boolean isAvailable;;

        Double price;
    }

}
