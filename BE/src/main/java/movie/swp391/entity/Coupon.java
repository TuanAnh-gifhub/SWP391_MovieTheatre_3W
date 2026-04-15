package movie.swp391.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import movie.swp391.constant.DiscountType;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "coupon")
public class Coupon {

    @Id
    @GeneratedValue
    private Integer id;

    private String name;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DiscountType discountType;

    @Column(nullable = false)
    private Double discountValue;


    @Column(nullable = false)
    private int usageLimit;

    @Column(nullable = false)
    private int usedCount = 0;

    @Column(nullable = false)
    private LocalDateTime expirationDate;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = true)
    private Boolean isGame=false;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}