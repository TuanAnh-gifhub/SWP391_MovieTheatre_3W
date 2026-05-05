package movie.swp391.repository;

import movie.swp391.entity.Cinema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CinemaRepository extends JpaRepository<Cinema, Integer> {
  @Query("SELECT td.name FROM Cinema td " +
          "JOIN td.cinemaRooms cr " +
          "JOIN cr.showtimes st " +
          "JOIN st.movie m " +
          "WHERE m.movieID = :movieId AND st.date = :date")
  List<String> findCinemaByMovieIDAndDate(@Param("movieId") Integer movieId, @Param("date") LocalDate date);

  List<Cinema> findByCity_NameIgnoreCase(String cityName);

  Optional<Cinema> findByNameIgnoreCaseAndAddressIgnoreCaseAndCity_CityID(String name, String address, Integer cityId);

  boolean existsByNameIgnoreCaseAndAddressIgnoreCaseAndCity_CityID(String name, String address, Integer cityId);

  boolean existsByNameIgnoreCaseAndAddressIgnoreCaseAndCity_CityIDAndCinemaIDNot(String name, String address, Integer cityId, Integer cinemaId);
}