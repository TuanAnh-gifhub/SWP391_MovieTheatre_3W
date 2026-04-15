package movie.swp391.request.employee;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRequest {
    // Employee Profile Fields
    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must be less than 100 characters")
    private String fullName;

    @NotNull(message = "Date of birth is required")
    private LocalDate dob;

    @NotBlank(message = "Sex is required")
    @Pattern(regexp = "MALE|FEMALE", message = "Sex must be MALE or FEMALE")
    private String sex;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100)
    private String email;

    @NotBlank(message = "Identity card is required")
    @Size(max = 20)
    private String identityCard;

    @NotBlank(message = "Phone number is required")
    @Size(max = 20)
    private String phone;

    @NotBlank(message = "Address is required")
    @Size(max = 255)
    private String address;

    @NotBlank(message = "Department is required")
    @Size(max = 50)
    private String department;

    private String image; // optional

    @NotNull(message = "Status is required")
    private Boolean active; // trạng thái nhân viên

    // Account Creation/Update Fields
    private String username; // for add
    private String password; // for add/edit
    private String confirmPassword; // for add/edit
} 