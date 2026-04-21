package movie.swp391.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)


public class PaymentRequest {
   Integer bookingId;
    Double totalMoney;
    Integer paymentId;
    String paymentGateway;
    String ipAddress;
    boolean isSuccess;
    Integer cinemaRoomId;
    List<Integer> seats;
}
