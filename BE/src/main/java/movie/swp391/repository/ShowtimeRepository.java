package movie.swp391.repository;

import movie.swp391.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Integer> {
    List<Showtime> findByMovieMovieIDAndDateAfterOrDateEquals(Integer movieID, LocalDate date1, LocalDate date2);

    List<Showtime> findByMovieMovieIDAndDate(Integer movieID, LocalDate date);


    @Query("SELECT s.time FROM Showtime s WHERE s.date = :date AND s.cinemaRoom.cinemaRoomID = :cinemaRoomId")
    List<LocalTime> findTimesByDateAndCinemaRoom(@Param("date") LocalDate date, @Param("cinemaRoomId") Integer cinemaRoomId);


    @Query(value = """
    SELECT m.running_time
    FROM showtimes s
    JOIN movies m ON m.movieid = s.movieid
    WHERE s.date = :date
      AND CONVERT(time, s.time) = CONVERT(time, :time)
      AND s.cinema_roomid = :cinemaRoomId
    """, nativeQuery = true)
    Integer findMovie_RunningTimeByDateAndTime(
            @Param("date") LocalDate date,
            @Param("time") LocalTime time,
            @Param("cinemaRoomId") Integer cinemaRoomId);

    @Query(value = """
        SELECT CASE WHEN COUNT(1) > 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END
        FROM showtimes s
        WHERE s.date = :date
          AND s.cinema_roomid = :cinemaRoomID
          AND CONVERT(time, s.time) = CONVERT(time, :time)
        """, nativeQuery = true)
    boolean existsByDateAndCinemaRoom_CinemaRoomIDAndTime(
            @Param("date") LocalDate date,
            @Param("cinemaRoomID") Integer cinemaRoomID,
            @Param("time") LocalTime time
    );

    List<Showtime> findByDateAndCinemaRoom_CinemaRoomID(LocalDate date, Integer cinemaRoomId);

    Optional<Showtime> findTopByMovie_MovieIDOrderByDateDescTimeDesc(Integer movieId);

    Optional<Showtime> findTopByMovie_MovieIDOrderByDateAscTimeAsc(Integer movieId);

    List<Showtime> findAllByMovie_MovieID(Integer movieMovieID);

    List<Showtime> findByMovie_MovieID(Integer movieMovieID);

    @Query(value = """
    SELECT * FROM showtimes s
    WHERE s.movieid = :movieId
      AND s.date = :date
      AND CONVERT(time, s.time) = CONVERT(time, :time)
      AND s.cinema_roomid = :cinemaRoomId
    """, nativeQuery = true)
    Showtime findMatchingShowtime(
            @Param("movieId") Integer movieId,
            @Param("date") LocalDate date,
            @Param("time") LocalTime time,
            @Param("cinemaRoomId") Integer cinemaRoomId
    );

    List<Showtime> findByCinemaRoom_CinemaRoomID(Integer cinemaRoomId);

    @Query(value = """
        SELECT * FROM showtimes
        WHERE cinema_roomid = :cinemaRoomId
          AND (
            [date] > :today
            OR ([date] = :today AND [time] > CAST(:nowTime AS time))
          )
    """, nativeQuery = true)
    List<Showtime> findFutureShowtimesByCinemaRoom(
        @Param("cinemaRoomId") Integer cinemaRoomId,
        @Param("today") java.time.LocalDate today,
        @Param("nowTime") java.time.LocalTime nowTime
    );

    @Query("SELECT s FROM Showtime s WHERE s.date = :date AND s.cinemaRoom.cinema.cinemaID = :cinemaId")
    List<Showtime> findByDateAndCinemaRoom_Cinema_CinemaID(@Param("date") LocalDate date, @Param("cinemaId") Integer cinemaId);
}