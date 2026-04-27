package movie.swp391.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import java.time.LocalDateTime;


@Entity
@Table(name = "Comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(columnDefinition = "nvarchar(MAX)")
    private String content;

    @Min(1)
    @Max(5)
    private Integer rating;

    private Boolean edited = false;

    @ManyToOne
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    private Boolean hidden = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}
