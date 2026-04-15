package movie.swp391.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)


public class AccountResponse {
    Integer accountID;
    String username;
    String password;
    String role;
    String fullName;
    LocalDate dob;
    String sex;
    String email;
    String identityCard;
    String phone;
    String address;
    String department;
    String image;
    Integer score;
    String rank;
    String rankImage;
    Integer plusScore;
    Integer minusScore;
    Boolean active;

    LocalDateTime updatedDate;

}
