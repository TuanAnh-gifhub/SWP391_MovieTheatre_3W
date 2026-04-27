package movie.swp391.entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    private Integer customerID;

    @OneToOne
    @MapsId
    @JoinColumn(name = "CustomerID")
    private Account account;

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must be less than 100 characters")
    @Column(length = 100, nullable = false, columnDefinition = "nvarchar(100)")
    private String fullName;

    @NotNull(message = "Date of birth is required")
    @Column(nullable = false)
    private LocalDate dob;

    @NotBlank(message = "Sex is required")
    @Pattern(regexp = "MALE|FEMALE", message = "Sex must be MALE or FEMALE")
    @Column(length = 10, nullable = false)
    private String sex;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100)
    @Column(length = 100, nullable = false)
    private String email;

    @NotBlank(message = "Identity card is required")
    @Size(max = 20)
    @Column(length = 20, nullable = false)
    private String identityCard;

    @NotBlank(message = "Phone number is required")
    @Size(max = 20)
    @Column(length = 20, nullable = false)
    private String phone;

    @NotBlank(message = "Address is required")
    @Size(max = 255)
    @Column(length = 255, nullable = false, columnDefinition = "nvarchar(200)")
    private String address;


    @Column(columnDefinition = "int default 0", nullable = false)
    private Integer score = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @Column(nullable = false)
    private LocalDateTime updatedDate;

    @OneToMany(mappedBy = "customer")
    private List<TicketBooking> bookings;

    @OneToMany(mappedBy = "customer")
    private List<ScoreHistory> scoreHistories;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FavoriteMovie> favoriteMovies ;

    private Integer finalScore=0;

    @Column(nullable = true)
    private Boolean isGamePlayed;

    @Column(nullable = true)
    private LocalDateTime dateGameCheck;

    @OneToMany(mappedBy = "customer")
    private List<CouponViewUsage> couponViewUsages;

    // Loyalty tier removed

    @PrePersist
    public void onCreate() {
        createdDate = LocalDateTime.now();
        updatedDate = createdDate;
    }

    @PreUpdate
    public void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
}

