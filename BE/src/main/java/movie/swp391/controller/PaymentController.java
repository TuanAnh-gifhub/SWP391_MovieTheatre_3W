package movie.swp391.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.entity.PaymentMethod;
import movie.swp391.request.*;
import movie.swp391.response.ApiResponse;
import movie.swp391.service.PaymentService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class PaymentController {
    PaymentService paymentService;


    @PostMapping
    public ApiResponse<String> paymentProcess(@RequestBody PaymentRequest request) {
        return ApiResponse.<String>builder()
                .result(paymentService.processPayment(request))
                .message("Success")
                .status(200)
                .build();
    }

    @PostMapping("/payment-status")
    public ApiResponse<String> paymentResult(@RequestBody PaymentResultRequest request) {
        return ApiResponse.<String>builder()
                .result(paymentService.resultPayment(request))
                .message("Success")
                .status(200)
                .build();
    }

    @PostMapping("/payos/webhook")
    public Map<String, Object> handlePayOsWebhook(@RequestBody Map<String, Object> payload) {
        return paymentService.handlePayOsWebhook(payload);
    }

    @GetMapping("/view-all-payments")
    public ApiResponse<List<PaymentMethod>> getAllMovies() {
        return ApiResponse.<List<PaymentMethod>>builder()
                .result(paymentService.getAllPayment())
                .message("Success")
                .status(200)
                .build();
    }

    // Pay-by-points and exchange-point endpoints removed
}

