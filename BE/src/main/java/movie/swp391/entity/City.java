package movie.swp391.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "City")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class City {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cityID;

    @NotBlank(message = "City name is required")
    @Size(max = 100, message = "City name must be less than 100 characters")
    @Column(length = 100, nullable = false, columnDefinition = "nvarchar(100)")
    private String name;

    @OneToMany(mappedBy = "city", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Cinema> cinemas;
}