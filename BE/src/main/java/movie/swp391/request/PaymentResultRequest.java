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


public class PaymentResultRequest {
   Integer bookingId;
    Double totalMoney;
    Integer cinemaRoomId;
    List<Integer> seats;
    String paymentGateway;
    String vnp_ResponseCode;
    String vnp_TransactionStatus;
    String vpc_TxnResponseCode;
    String payosOrderCode;
    String payosStatus;
    String payosCode;
    String couponCode;
    List<Integer> selectedPromotionIds;

}
