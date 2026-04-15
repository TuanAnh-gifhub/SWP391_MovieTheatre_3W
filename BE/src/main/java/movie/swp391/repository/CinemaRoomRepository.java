package movie.swp391.repository;

import movie.swp391.entity.CinemaRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CinemaRoomRepository extends JpaRepository<CinemaRoom, Integer> {
    List<CinemaRoom> findByCinemaCinemaID(Integer cinemaId);

    Optional<CinemaRoom> findByRoomName(String roomName);


    @Query("SELECT cr.cinema.cinemaID, COUNT(s) FROM CinemaRoom cr LEFT JOIN cr.seats s GROUP BY cr.cinema.cinemaID, cr.cinemaRoomID")
    List<Object[]> findCinemaIdAndSeatCountPerRoom();



    @Query("SELECT cr.cinema.cinemaID, cr.seatQuantity, cr.cinemaRoomID FROM CinemaRoom cr")
    List<Object[]> findCinemaIdSeatCountAndRoomId();
}