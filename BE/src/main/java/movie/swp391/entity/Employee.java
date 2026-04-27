package movie.swp391.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    private Integer employeeID;

    @OneToOne
    @MapsId
    @JoinColumn(name = "EmployeeID")
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
    @Column(length = 10, nullable = false, columnDefinition = "nvarchar(10)")
    private String sex;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100)
    @Column(length = 100, nullable = false, columnDefinition = "nvarchar(100)")
    private String email;

    @NotBlank(message = "Identity card is required")
    @Size(max = 20)
    @Column(length = 20, nullable = false, columnDefinition = "nvarchar(20)")
    private String identityCard;

    @NotBlank(message = "Phone number is required")
    @Size(max = 20)
    @Column(length = 20, nullable = false, columnDefinition = "nvarchar(20)")
    private String phone;

    @NotBlank(message = "Address is required")
    @Size(max = 255)
    @Column(length = 255, nullable = false, columnDefinition = "nvarchar(255)")
    private String address;

    @NotBlank(message = "Department is required")
    @Size(max = 50)
    @Column(length = 50, nullable = false, columnDefinition = "nvarchar(50)")
    private String department;

    @Size(max = 255)
    @Column(length = 255, columnDefinition = "nvarchar(255)")
    private String image;

    @Column(nullable = false)
    private Boolean active = true; // trạng thái nhân viên

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @Column(nullable = false)
    private LocalDateTime updatedDate;

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

