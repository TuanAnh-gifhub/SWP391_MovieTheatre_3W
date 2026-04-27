package movie.swp391.request.member;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;


    private String password;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Sex is required")
    private String sex;

    @Email(message = "Email is invalid")
    private String email;

    @NotBlank(message = "Identity card is required")
    private String identityCard;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotBlank(message = "Address is required")
    private String address;
}


