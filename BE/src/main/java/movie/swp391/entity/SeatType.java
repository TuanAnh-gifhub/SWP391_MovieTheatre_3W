package movie.swp391.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "seat_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer seatTypeID;

    @NotBlank(message = "Seat type code is required")
    @Size(max = 50, message = "Seat type code must be less than 50 characters")
    @Column(length = 50, nullable = false, unique = true)
    private String code;

    @NotBlank(message = "Seat type name is required")
    @Size(max = 100, message = "Seat type name must be less than 100 characters")
    @Column(length = 100, nullable = false, unique = true)
    private String name;

    @Size(max = 255, message = "Seat type description must be less than 255 characters")
    @Column(length = 255)
    private String description;

    @DecimalMin(value = "0.0", inclusive = true, message = "Base price must be zero or positive")
    @Column(nullable = false)
    private Double basePrice;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Integer sortOrder = 0;

    @JsonIgnore
    @OneToMany(mappedBy = "seatTypeRef")
    private List<Seat> seats;
}

