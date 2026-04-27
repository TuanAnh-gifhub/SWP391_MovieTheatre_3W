package movie.swp391.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "Showtimes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Showtime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer showtimeID;

    @ManyToOne
    @JoinColumn(name = "MovieID", nullable = true)
    private Movie movie;

    @ManyToOne
    @JoinColumn(name = "CinemaRoomID", nullable = true)
    private CinemaRoom cinemaRoom;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Time is required")
    @Column(columnDefinition = "time(7)")
    private LocalTime time;

    @Column(length = 10)
    private String version;

    @Column(nullable = true)
    private Boolean active=false;

    @OneToMany(mappedBy = "showtime")
    private List<TicketBooking> bookings;


}

