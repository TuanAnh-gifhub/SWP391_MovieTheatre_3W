package movie.swp391.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MockPaymentRequest {
    private Integer bookingId;
    private Integer customerId;
}
