package movie.swp391.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import movie.swp391.request.TicketBookingRequest;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)


public class PaymentResponse {

    TicketBookingResponse bookingResponse;
    Integer paymentId;
    boolean isSuccess;
    TicketBookingRequest ticketBookingRequest;
}
