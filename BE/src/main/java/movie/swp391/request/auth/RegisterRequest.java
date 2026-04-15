package movie.swp391.request.auth;

import lombok.*;
import java.time.LocalDate;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String confirmPassword;
    private String fullName;
    private LocalDate dateOfBirth;
    private String sex;
    private String identityCard;
    private String email;
    private String address;
    private String phoneNumber;
}
