package movie.swp391.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import movie.swp391.entity.ScoreHistory;
import movie.swp391.entity.TicketBooking;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)


public class CustomerResponse {
    Integer accountID;
    String username;
    String password;
    String fullName;
    LocalDate dob;
    String sex;
    String email;
    String identityCard;
    String phone;
    String address;
    Integer score;
    LocalDateTime updatedDate;
    String rank;
    String rankImage;
    Integer finalScore;
    List<TicketBooking> bookings;
    List<ScoreHistory> scoreHistories;
}
