package movie.swp391.service;

import movie.swp391.entity.PaymentMethod;
import movie.swp391.request.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

public interface PaymentService {
    String processPayment(PaymentRequest request);
    String resultPayment(PaymentResultRequest request);
    Map<String, Object> handlePayOsWebhook(Map<String, Object> payload);
    List<PaymentMethod> getAllPayment();
    // Pay-by-points feature removed: related methods deleted




}

