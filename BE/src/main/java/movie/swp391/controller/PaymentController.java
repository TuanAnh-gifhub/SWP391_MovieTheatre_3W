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
import movie.swp391.serviceImp.PayPalServiceImpl;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import com.paypal.api.payments.Payment;


import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class PaymentController {
    PaymentService paymentService;
    PayPalServiceImpl payPalService;


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


    @GetMapping("/payment-paypal-success")
    public ApiResponse<String> paymentSuccess(
            @RequestParam("paymentId") String paymentId,
            @RequestParam("PayerID") String payerId,
            @RequestParam("orderId") Integer orderId) throws IOException {
        try {
            Payment payment = payPalService.executePayment(paymentId, payerId);

            String status = "E";
            String country = "";
            String method = "";
            String amount = "";

            if ("approved".equalsIgnoreCase(payment.getState())) {
                status = "0";
            }

            // Lấy quốc gia
            if (payment.getPayer() != null && payment.getPayer().getPayerInfo() != null) {
                country = payment.getPayer().getPayerInfo().getCountryCode();
            }

            // Lấy phương thức thanh toán
            if (payment.getPayer() != null) {
                method = payment.getPayer().getPaymentMethod();
            }

            // Lấy số tiền
            if (payment.getTransactions() != null && !payment.getTransactions().isEmpty()) {
                double usdAmount = Double.parseDouble(payment.getTransactions().get(0).getAmount().getTotal());
                amount = String.valueOf(usdAmount * 25000);
            }
            // Redirect về URL mong muốn
            String redirectUrl = String.format(
                    "http://localhost:8080/payment-success?orderId=%d&payPal_Code=%s&payPal_Locale=%s&payPal_Card=%s&payPal_Amount=%s",
                    orderId,
                    status,
                    country != null ? country : "",
                    method != null ? method : "",
                    amount != null ? amount : ""
            );
            return ApiResponse.<String>builder()
                    .result(redirectUrl)
                    .message("Thanh toán thành công")
                    .status(200)
                    .build();

        } catch (Exception e) {
            // Redirect về URL thất bại

            return ApiResponse.<String>builder()
                    .result("http://localhost:8080/payment-success?payPal_Code=E")
                    .message("Thanh toán thất bại")
                    .status(200)
                    .build();
        }
    }





}
