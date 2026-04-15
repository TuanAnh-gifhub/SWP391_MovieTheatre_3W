package movie.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "LoyaltyTier")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyTier {


    @Id
    @GeneratedValue
    private Integer id;

    private String name;

    private Integer pointThreshold;

    private Double discountPercent;

    private Boolean isActive = true;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String rankLink;


    @OneToMany(mappedBy = "loyaltyTier", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Customer> customers;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}