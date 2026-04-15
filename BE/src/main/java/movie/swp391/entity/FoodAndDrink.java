package movie.swp391.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "FoodAndDrink")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoodAndDrink {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String name;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String type;

    @Column(length = 255)
    private String image;

    @Column(nullable = false)
    private Boolean active = true;
}