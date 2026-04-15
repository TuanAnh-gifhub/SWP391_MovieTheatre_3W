package movie.swp391.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ShowTimeForCustomerResponse {
    Integer showtimeID;
    List<LocalDateGroup> dates;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocalDateGroup {
        LocalDate date;
        List<CityDTO> cities;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CityDTO {
        Integer cityID;
        String name;
        List<CinemaDTO> cinemas;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CinemaDTO {
        Integer cinemaID;
        String name;
        String address;
        List<CinemaRoomDTO> cinemaRooms;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CinemaRoomDTO {
        Integer cinemaRoomID;
        String roomName;
        Integer seatQuantity;
        List<ShowtimeDTO> times;

    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShowtimeDTO {
        LocalTime time;
        List<SeatDTO> seats;  // Seats for each showtime
        private Boolean active;

    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatDTO {
        Integer seatID;
        String seatName;
        String seatType;
        String status;
        Double price;
        Boolean isAvailable;
    }
}