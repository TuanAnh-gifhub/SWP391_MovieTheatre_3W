package movie.swp391.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "export_movie_dates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExportMovieDate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Many-to-one với Movie
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @Column(nullable = false)
    private LocalDate exportDate;

    @Column(nullable = false)
    private Double totalMoney = 0.0;

    @Column(nullable = false)
    private Double totalMoneyWithoutFoodAndDiscount = 0.0;

    @Column(nullable = false)
    private Double totalMoneyDiscount = 0.0;

    @Column(nullable = false)
    private Double totalMoneyFood = 0.0;

    @Column(nullable = true)
    private Double seller = 0.0;

    @Column(nullable = true)
    private Double buyFromScoresToMoney = 0.0;
}
