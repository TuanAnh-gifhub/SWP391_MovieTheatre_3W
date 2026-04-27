package movie.swp391.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "Movies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer movieID;

    @NotBlank(message = "Title is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100,columnDefinition = "nvarchar(100)")
    private String title;


    @Size(max = 255)
    @Column(length = 255 ,columnDefinition = "nvarchar(255)")
    private String actors;

    @Size(max = 100)
    @Column(length = 100, columnDefinition = "nvarchar(100)")
    private String director;

    @Size(max = 100)
    @Column(length = 100,columnDefinition = "nvarchar(100)")
    private String productionCompany;

    @Positive(message = "thời gian phim chiếm dụng không hợp lệ")
    @Column
    private Integer runningTime;

    @Size(max = 10)
    @Column(length = 10,columnDefinition = "nvarchar(10)")
    private String version; // 2D, 3D

    @Size(max = 255)
    @Column(length = 255,columnDefinition = "nvarchar(1000)")
    private String trailer;

    @Column(columnDefinition = "nvarchar(3000)")
    private String content;

    @Size(max = 255)
    @Column(length = 255,columnDefinition = "nvarchar(1000)")
    private String poster;

    @Size(max = 50)
    @Column(length = 50,columnDefinition = "nvarchar(50)")
    private String genre; // Thêm thể loại phim


    @Size(max = 50)
    @Column(length = 50, columnDefinition = "nvarchar(50)")
    private String language;

    @Size(max = 10)
    @Column(length = 10, columnDefinition = "nvarchar(10)")
    private String ageRating;

    private LocalDate releaseDate;

    private Integer seller=0;

    private String autoGenre;

    private Integer rank;

   private Double totalMoney=0.0;

   private Double totalMoneyWithoutFood=0.0;

   private Double totalMoneyDiscount=0.0;

   private Double totalMoneyFood=0.0;

   @Column(nullable = true)
    private Double buyFromScores=0.0;

    @Column(nullable = false)
    private Boolean active=true;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "status_period_id", nullable = true)
    private MovieStatusPeriod movieStatusPeriod;

    @OneToMany(mappedBy = "movie")
    private List<Showtime> showtimes;


    @Column(name = "number_showtime")
    private Integer numberShowtime;


    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FavoriteMovie> favoredByCustomers;

    @PrePersist
    public void prePersist() {
        if (active == null) {
            active = true;
        }
    }

}

