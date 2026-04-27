package movie.swp391.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "Admins")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Admin {

    @Id
    private Integer adminID;

    @OneToOne
    @MapsId
    @JoinColumn(name = "AdminID")
    private Account account;

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must be less than 100 characters")
    @Column(length = 100, columnDefinition = "nvarchar(100)")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100)
    @Column(length = 100, columnDefinition = "nvarchar(100)")
    private String email;
}
