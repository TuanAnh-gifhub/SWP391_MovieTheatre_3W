package movie.swp391.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "coupon_view_usage")
public class CouponViewUsage {
    @Id
    @GeneratedValue
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

    @Column(nullable = false)
    private LocalDateTime viewedAt;

    @Column(nullable = false)
    private Boolean isViewed;

    @PrePersist
    public void prePersist() {
        if (isViewed == null) {
            isViewed = false;
        }

        if (viewedAt == null) {
            viewedAt = LocalDateTime.now().minusSeconds(3);
        }
    }
} 