package movie.swp391.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Cinemas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cinema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cinemaID;

    @NotBlank(message = "Cinema name is required")
    @Size(max = 100, message = "Cinema name must be less than 100 characters")
    @Column(length = 100, columnDefinition = "nvarchar(100)")
    private String name;

    @NotBlank(message = "Address is required")
    @Column(length = 255, columnDefinition = "nvarchar(255)")
    private String address;


    @OneToMany(mappedBy = "cinema", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CinemaRoom> cinemaRooms;

    @ManyToOne
    @JoinColumn(name = "city_id", nullable =true)
    private City city;

    @OneToMany(mappedBy = "cinema", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CinemaCost> cinemaCosts = new ArrayList<>();
}
