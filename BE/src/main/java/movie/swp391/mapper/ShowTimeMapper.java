package movie.swp391.mapper;


import movie.swp391.entity.Cinema;
import movie.swp391.entity.CinemaRoom;
import movie.swp391.entity.City;
import movie.swp391.entity.Showtime;
import movie.swp391.response.ShowTimeV1Response;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Mapper(componentModel = "spring")
public interface ShowTimeMapper {

    // Mapping the Showtime to TimeWithMovieTitleDTO
    @Mapping(source = "movie.title", target = "movieTitle")
    @Mapping(source = "movie.movieID", target = "movieId")
    @Mapping(source = "active", target = "active")
    @Mapping(target = "toTime", expression = "java(calculateToTime(showtime))")
    ShowTimeV1Response.TimeWithMovieTitleDTO toTimeWithMovieTitleDTO(Showtime showtime);

    default LocalTime calculateToTime(Showtime showtime) {
        LocalTime time = showtime.getTime();
        int runTimeInMinutes = showtime.getMovie().getRunningTime();
        return time.plusMinutes(runTimeInMinutes);
    }

    // Method to map DateShowtimeDTO
    default ShowTimeV1Response.DateShowtimeDTO toDateShowtimeDTO(LocalDate date, List<Showtime> showtimes) {
        List<ShowTimeV1Response.TimeWithMovieTitleDTO> times = showtimes.stream()
                .map(this::toTimeWithMovieTitleDTO)
                .collect(Collectors.toList());

        return ShowTimeV1Response.DateShowtimeDTO.builder()
                .date(date)
                .times(times)
                .build();
    }

    // Method to map CinemaRoomDTO
    default ShowTimeV1Response.CinemaRoomDTO toCinemaRoomDTO(CinemaRoom room) {
        Map<LocalDate, List<Showtime>> grouped = room.getShowtimes().stream()
                .collect(Collectors.groupingBy(Showtime::getDate));

        List<ShowTimeV1Response.DateShowtimeDTO> dateShowtimeList = grouped.entrySet().stream()
                .map(entry -> toDateShowtimeDTO(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        return ShowTimeV1Response.CinemaRoomDTO.builder()
                .cinemaRoomID(room.getCinemaRoomID())
                .roomName(room.getRoomName())
                .showtimes(dateShowtimeList)
                .build();
    }

    // Method to map CinemaDTO
    default ShowTimeV1Response.CinemaDTO toCinemaDTO(Cinema cinema) {
        List<ShowTimeV1Response.CinemaRoomDTO> roomDTOs = cinema.getCinemaRooms().stream()
                .map(this::toCinemaRoomDTO)
                .collect(Collectors.toList());

        return ShowTimeV1Response.CinemaDTO.builder()
                .cinemaID(cinema.getCinemaID())
                .name(cinema.getName())
                .cinemaRooms(roomDTOs)
                .build();
    }

    // Method to map CinemaDTO list
    default List<ShowTimeV1Response.CinemaDTO> toCinemaDTOs(List<Cinema> cinemas) {
        return cinemas.stream()
                .map(this::toCinemaDTO)
                .collect(Collectors.toList());
    }

    // Method to map City response
    default ShowTimeV1Response toCityResponse(City city) {
        List<ShowTimeV1Response.CinemaDTO> cinemaDTOs = city.getCinemas().stream()
                .map(this::toCinemaDTO)
                .collect(Collectors.toList());

        return ShowTimeV1Response.builder()
                .cityName(city.getName())
                .cinemas(cinemaDTOs)
                .build();
    }
}