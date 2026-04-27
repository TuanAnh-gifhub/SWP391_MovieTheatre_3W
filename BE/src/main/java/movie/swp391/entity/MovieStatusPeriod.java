package movie.swp391.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
@Entity
@Table(name = "MovieStatusPeriods")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieStatusPeriod {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull
  @Column(nullable = false)
  private LocalDate fromDate;

  @NotNull
  @Column(nullable = false)
  private LocalDate toDate;

  @Size(max = 50)
  @Column(length = 50, columnDefinition = "nvarchar(50)", insertable = false, updatable = false)
  private String status;

  @OneToMany(mappedBy = "movieStatusPeriod")
  private List<Movie> movies;


}
