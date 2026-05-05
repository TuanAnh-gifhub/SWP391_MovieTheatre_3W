package movie.swp391.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "TicketDetails")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer ticketDetailID;

    @ManyToOne
    @JoinColumn(name = "BookingID", nullable = false)
    @NotNull(message = "Booking is required")
    private TicketBooking booking;

    @ManyToOne
    @JoinColumn(name = "SeatID", nullable = false)
    @NotNull(message = "Seat is required")
    private Seat seat;

    // Snapshot fields to preserve seat information at booking time
    @Column(name = "seat_type_snapshot", length = 20)
    private String seatTypeSnapshot;

    @Column(name = "seat_row_snapshot", length = 5)
    private String seatRowSnapshot;

    @Column(name = "seat_column_snapshot")
    private Integer seatColumnSnapshot;

    private String checkSeat;


    @NotNull(message = "Unit price is required")
    @PositiveOrZero(message = "Unit price must be zero or positive")
    @Column(name = "unit_price")
    private Double unitPrice;


}
