package movie.swp391.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "Seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer seatID;

    @NotBlank(message = "Seat name is required")
    @Size(max = 10, message = "Seat name must be less than 10 characters")
    @Column(length = 10, nullable = false)
    private String seatName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CinemaRoomID", nullable = false)
    @NotNull(message = "CinemaRoom is required")
    private CinemaRoom cinemaRoom;

    @NotBlank(message = "Seat type is required")
    @Size(max = 20)
    @Column(length = 20, nullable = false)
    private String seatType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_type_id")
    private SeatType seatTypeRef;

    @Size(max = 20)
    @Column(length = 20, nullable = true)
    private String status;

    @Column(nullable = true)
    private Double price;  // Giá vé ghế này (nếu khác nhau)

    @Size(max = 5)
    @Column(length = 5)
    private String row;  // Ví dụ "A", "B", "C"

    @Column(name = "SeatColumn")
    private Integer column;

    @Column(nullable = true)
    private Boolean isAvailable;

    @OneToMany(mappedBy = "seat")
    private List<TicketDetail> ticketDetails;

    @Transient
    public String getSeatTypeLabel() {
        if (seatTypeRef != null && seatTypeRef.getName() != null && !seatTypeRef.getName().isBlank()) {
            return seatTypeRef.getName();
        }
        return seatType;
    }

    @Transient
    public Double getEffectivePrice() {
        if (price != null) {
            return price;
        }
        if (seatTypeRef != null && seatTypeRef.getBasePrice() != null) {
            return seatTypeRef.getBasePrice();
        }
        return 0.0;
    }
}

