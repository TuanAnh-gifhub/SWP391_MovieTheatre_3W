package movie.swp391.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "coupon_usage")
public class CouponUsage {
    @Id
    @GeneratedValue
    private Integer id;

    @ManyToOne
    private Customer customer;

    @ManyToOne
    private Coupon coupon;

    private LocalDateTime usedAt;

}