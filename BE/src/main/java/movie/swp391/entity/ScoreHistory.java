package movie.swp391.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ScoreHistory")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScoreHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer scoreID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CustomerID", nullable = false)
    @NotNull(message = "Customer is required")
    private Customer customer;

    @NotBlank(message = "Action type is required")
    @Size(max = 20, message = "Action type must be less than 20 characters")
    @Column(length = 20)
    private String actionType; // VD: "earn", "redeem", "adjust"

    @NotNull(message = "Date is required")
    private LocalDateTime date;

    @NotNull(message = "Amount is required")
    private Integer amount;

    @Size(max = 255, message = "Note must be less than 255 characters")
    @Column(length = 255)
    private String note;
}
