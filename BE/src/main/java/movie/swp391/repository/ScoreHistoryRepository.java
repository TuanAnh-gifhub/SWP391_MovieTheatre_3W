package movie.swp391.repository;

import movie.swp391.entity.ScoreHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ScoreHistoryRepository extends JpaRepository<ScoreHistory, Integer> {
    @Query("SELECT sh FROM ScoreHistory sh " +
            "JOIN FETCH sh.customer c " +
            "JOIN FETCH c.bookings b " +
            "WHERE c.customerID = :customerId")
    List<ScoreHistory> findByCustomerId(@Param("customerId") Integer customerId);

    List<ScoreHistory> findAllByCustomer_CustomerID(Integer customerId);

}