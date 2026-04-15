package movie.swp391.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "CinemaRooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CinemaRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cinemaRoomID;

    @NotBlank(message = "Room name is required")
    @Size(max = 100, message = "Room name must be less than 100 characters")
    @Column(length = 100)
    private String roomName;

    @NotNull(message = "Seat quantity is required")
    @Min(value = 1, message = "Seat quantity must be at least 1")
    private Integer seatQuantity;

    @OneToMany(mappedBy = "cinemaRoom")
    private List<Seat> seats;

    @OneToMany(mappedBy = "cinemaRoom")
    private List<Showtime> showtimes;

    @ManyToOne
    @JoinColumn(name = "cinema_id", nullable = true)
    private Cinema cinema;

    @Builder.Default
    private boolean active = true;


}
