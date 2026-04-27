package movie.swp391.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "TicketBookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer bookingID;

    @ManyToOne
    @JoinColumn(name = "CustomerID", nullable = false)
    @NotNull(message = "Customer is required")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "ShowtimeID", nullable = true)
    private Showtime showtime;

    @NotNull(message = "Booking date is required")
    private LocalDateTime bookingDate;

    @NotNull(message = "Total price is required")
    @PositiveOrZero(message = "Total price must be zero or positive")
    private Double totalPrice;

    private Integer convertedScore;

    @Column(length = 20)
    private String status = "pending";

    @Column(name = "movie_title", length = 100)
    private String movieTitle;

    @Column(name = "movie_poster", length = 100)
    private String poster;

    @Column(columnDefinition = "nvarchar(100)")
    private String city;

    @Column(columnDefinition = "nvarchar(100)")
    private String cinemaName;


    private LocalDate dateShow;

    @Column(columnDefinition = "time(7)")
    private LocalTime timeShow;

    private String roomName;

    @ManyToOne
    @JoinColumn(name = "paymentId", referencedColumnName = "id")
    private PaymentMethod paymentMethod;

    @Column(name = "payos_order_code", length = 64)
    private String payosOrderCode;

    @Column(name = "payos_payment_link_id", length = 128)
    private String payosPaymentLinkId;


    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    private List<TicketDetail> ticketDetails;

    @ManyToMany
    @JoinTable(name = "booking_promotion",
            joinColumns = @JoinColumn(name = "booking_id"),
            inverseJoinColumns = @JoinColumn(name = "promotion_id"))
    private List<Promotion> promotions;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    private List<BookingFoodAndDrink> bookingFoodAndDrinks;
}
