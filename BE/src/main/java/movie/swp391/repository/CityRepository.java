package movie.swp391.repository;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import movie.swp391.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CityRepository extends JpaRepository<City, Integer> {
    Optional<Object> findByName(@NotBlank(message = "City name is required") @Size(max = 100, message = "City name must be less than 100 characters") String name);
    
    @Query("SELECT DISTINCT c FROM City c " +
           "LEFT JOIN FETCH c.cinemas cinema")
    List<City> findAllWithShowtimes();
    
    @Query("SELECT DISTINCT c FROM City c " +
           "LEFT JOIN FETCH c.cinemas cinema")
    List<City> findAllWithRooms();
}