package movie.swp391.repository;

import jakarta.transaction.Transactional;
import movie.swp391.entity.TicketDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketDetailRepository extends JpaRepository<TicketDetail, Integer> {
  @Query("SELECT td FROM TicketDetail td " +
          "JOIN FETCH td.booking tb " +
          "JOIN FETCH tb.showtime st " +
          "JOIN FETCH st.movie m " +
          "JOIN FETCH st.cinemaRoom cr " +
          "JOIN FETCH td.seat s " +
          "WHERE tb.customer.customerID = :customerId")

  List<TicketDetail> findByCustomerId(@Param("customerId") Long customerId);


  @Modifying
  @Transactional
  @Query("UPDATE TicketDetail td " +
          "SET td.checkSeat = 'Blank' " +
          "WHERE td.booking.bookingID = :id" )
  void updateCheckSeatToBlank(Integer id);


  List<TicketDetail> findBySeat_SeatIDAndCheckSeat(Integer seatSeatID, String checkSeat);


}