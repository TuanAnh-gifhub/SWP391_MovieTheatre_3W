package movie.swp391.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "booking_food_and_drink")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingFoodAndDrink {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private TicketBooking booking;

    @ManyToOne
    @JoinColumn(name = "food_and_drink_id")
    private FoodAndDrink foodAndDrink;

    private Integer quantity;
}