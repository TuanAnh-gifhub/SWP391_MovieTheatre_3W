package movie.swp391.mapper;


import movie.swp391.entity.*;
import movie.swp391.entity.*;
import movie.swp391.response.ShowTimeForCustomerResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.stream.Collectors;
@Mapper(componentModel = "spring")
public interface ShowTimeV2Mapper {


    ShowTimeForCustomerResponse toResponse(
            Integer showtimeId,
            List<ShowTimeForCustomerResponse.LocalDateGroup> dates
    );

    // Mapping City to CityDTO
    ShowTimeForCustomerResponse.CityDTO toCityDTO(City city);

    // Mapping Cinema to CinemaDTO
    ShowTimeForCustomerResponse.CinemaDTO toCinemaDTO(Cinema cinema);

    // Mapping CinemaRoom to CinemaRoomDTO
    ShowTimeForCustomerResponse.CinemaRoomDTO toCinemaRoomDTO(CinemaRoom room);

    // Mapping Seat to SeatDTO
    ShowTimeForCustomerResponse.SeatDTO toSeatDTO(Seat seat);

    // Mapping Showtime to ShowtimeDTO (showtime time and seats)
    @Mapping(target = "seats", expression = "java(mapSeatsForShowtime(showtime))") // Custom mapping for seats
    ShowTimeForCustomerResponse.ShowtimeDTO toShowtimeDTO(Showtime showtime);

    // Helper method to map seats for each specific showtime
    default List<ShowTimeForCustomerResponse.SeatDTO> mapSeatsForShowtime(Showtime showtime) {
        CinemaRoom room = showtime.getCinemaRoom();
        return room.getSeats().stream()
                .map(this::toSeatDTO)
                .collect(Collectors.toList());
    }
}
