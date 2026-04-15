package movie.swp391.service;

import movie.swp391.entity.PaymentMethod;
import movie.swp391.request.*;
import movie.swp391.request.*;
import movie.swp391.response.PayByPointResponse;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

public interface PaymentService {
    String processPayment(PaymentRequest request);
    String resultPayment(PaymentResultRequest request);
    List<PaymentMethod> getAllPayment();
    PayByPointResponse payByPointsShow(PayByPointRequest request);
    @PreAuthorize("hasRole('CUSTOMER')")
    String resultPaymentByPoint(ResultPayByPointRequest request);
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    String exchangePointForMoneyPlus(OutOfFoodReturnPointRequest request);




}

