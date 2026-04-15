package movie.swp391.repository;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import movie.swp391.entity.CinemaRoom;
import movie.swp391.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Integer> {
    List<Seat> findByCinemaRoom(CinemaRoom cinemaRoom);
    Seat findByCinemaRoomAndSeatName(CinemaRoom cinemaRoom, String seatName);

    List<Seat> findByCinemaRoom_CinemaRoomIDAndSeatName(Integer cinemaRoomCinemaRoomID, @NotBlank(message = "Seat name is required") @Size(max = 10, message = "Seat name must be less than 10 characters") String seatName);

    List<Seat> findByCinemaRoom_CinemaRoomID(Integer cinemaRoomId);


    List<Seat> findAllByCinemaRoom_CinemaRoomID(Integer cinemaRoomId);

    boolean existsBySeatNameAndCinemaRoom(String seatName, CinemaRoom room);

    int countByCinemaRoom(CinemaRoom room);
}