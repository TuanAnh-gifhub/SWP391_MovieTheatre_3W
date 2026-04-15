package movie.swp391.repository;

import jakarta.transaction.Transactional;
import movie.swp391.entity.TicketBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import movie.swp391.entity.Showtime;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketBookingRepository extends JpaRepository<TicketBooking, Integer> {
    List<TicketBooking> findByCustomerCustomerIDOrderByBookingDateDesc(Integer customerId);
    List<TicketBooking> findByCustomerCustomerIDAndStatusOrderByBookingDateDesc(Integer customerId, String status);
    List<TicketBooking> findByShowtimeShowtimeID(Integer showtimeId);


    Optional<TicketBooking> findTicketBookingByBookingID(Integer bookingID);

    @Query("SELECT CASE WHEN COUNT(td) > 0 THEN true ELSE false END FROM TicketDetail td JOIN td.booking b WHERE b.showtime = :showtime AND td.seat.seatName = :seatName AND b.status <> :cancelledStatus")
    boolean existsByShowtimeAndSeatNameAndStatusNot(@Param("showtime") Showtime showtime, @Param("seatName") String seatName, @Param("cancelledStatus") String cancelledStatus);

    List<TicketBooking> findByShowtime(Showtime showtime);

    @Transactional
    @Modifying
    @Query("UPDATE TicketBooking tb SET tb.status = 'Cancelled' WHERE tb.status = 'pending'and tb.bookingID =:bookingID")
    void updateStatusToCancelled(Integer bookingID);

    boolean existsByCustomerCustomerIDAndStatus(Integer customerId, String status);



    List<TicketBooking> findByStatus(String status);

    List<TicketBooking> findByBookingDateBetweenAndStatus(LocalDateTime from, LocalDateTime to, String status);

}