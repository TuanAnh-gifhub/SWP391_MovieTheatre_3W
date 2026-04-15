package movie.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "cinema_costs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CinemaCost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;


    private Double cost;

    private LocalDate date= LocalDate.now();

    @Column(length = 2550, columnDefinition = "nvarchar(2550)")
    private String description;

    @ManyToOne
    @JoinColumn(name = "cinema_id", nullable = false)
    private Cinema cinema;
}
