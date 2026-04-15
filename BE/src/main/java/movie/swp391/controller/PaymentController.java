package movie.swp391.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.entity.PaymentMethod;
import movie.swp391.request.*;
import movie.swp391.request.*;
import movie.swp391.response.ApiResponse;
import movie.swp391.response.PayByPointResponse;
import movie.swp391.service.PaymentService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;


import java.util.List;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class PaymentController {
    PaymentService paymentService;


    @PostMapping
    @PreAuthorize("@permissionService.hasPermission(authentication, 'CREATE_PAYMENT')")
    public ApiResponse<String> paymentProcess(@RequestBody PaymentRequest request) {
        return ApiResponse.<String>builder()
                .result(paymentService.processPayment(request))
                .message("Success")
                .status(200)
                .build();
    }

    @PostMapping("/payment-status")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'CREATE_PAYMENT')")
    public ApiResponse<String> paymentResult(@RequestBody PaymentResultRequest request) {
        return ApiResponse.<String>builder()
                .result(paymentService.resultPayment(request))
                .message("Success")
                .status(200)
                .build();
    }
    @GetMapping("/view-all-payments")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_PAYMENT')")
    public ApiResponse<List<PaymentMethod>> getAllMovies() {
        return ApiResponse.<List<PaymentMethod>>builder()
                .result(paymentService.getAllPayment())
                .message("Success")
                .status(200)
                .build();
    }

    @PostMapping("/pay-by-point-show")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'CREATE_PAYMENT')")
    public ApiResponse<PayByPointResponse> showPayByPoint(@RequestBody PayByPointRequest request) {
        return ApiResponse.<PayByPointResponse>builder()
                .result(paymentService.payByPointsShow(request))
                .message("Success")
                .status(200)
                .build();
    }

    @PostMapping("/result-pay-by-point")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'CREATE_PAYMENT')")
    public ApiResponse<String> resultPayByPoint(@RequestBody ResultPayByPointRequest request) {
        return ApiResponse.<String>builder()
                .result(paymentService.resultPaymentByPoint(request))
                .message("Success")
                .status(200)
                .build();
    }

    @PostMapping("/exchange-food-point")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'CREATE_PAYMENT')")
    public ApiResponse<String> exchangeFoodPoint(@RequestBody OutOfFoodReturnPointRequest request) {
        return ApiResponse.<String>builder()
                .result(paymentService.exchangePointForMoneyPlus(request))
                .message("Success")
                .status(200)
                .build();
    }
}

