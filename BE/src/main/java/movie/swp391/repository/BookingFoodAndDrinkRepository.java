package movie.swp391.repository;

import movie.swp391.entity.BookingFoodAndDrink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingFoodAndDrinkRepository extends JpaRepository<BookingFoodAndDrink, Integer> {
    List<BookingFoodAndDrink> findByBooking_BookingDateBetweenAndBooking_Status(LocalDateTime fromDate, LocalDateTime toDate, String status);
}