package movie.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Create a new entity for temporary account storage
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "temporary_accounts")
public class TemporaryAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String dateOfBirth;

    @Column(nullable = false)
    private String sex;

    @Column(nullable = false)
    private String identityCard;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String phoneNumber;
    // Add other necessary fields

    // Getters and setters
}

