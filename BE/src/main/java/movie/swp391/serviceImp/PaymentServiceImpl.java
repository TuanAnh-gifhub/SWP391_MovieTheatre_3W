package movie.swp391.serviceImp;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.entity.*;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.properties.PayOsProperties;
import movie.swp391.repository.*;
import movie.swp391.request.*;
import movie.swp391.service.*;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.webhooks.WebhookData;

import java.io.UnsupportedEncodingException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentServiceImpl implements PaymentService {

    VNpayService vnPayService;
    PaymentMethodRepository paymentMethodRepository;
    SeatRepository seatRepository;
    TicketBookingRepository ticketBookingRepository;
    TicketDetailRepository ticketDetailRepository;
    ScoreHistoryRepository scoreHistoryRepository;
    CouponRepository couponRepository;
    CouponUsageRepository couponUsageRepository;
    MovieRepository movieRepository;
    PromotionRepository promotionRepository;
    PromotionService promotionService;
    ExportService exportMovieDateService;
    CustomerRepository customerRepository;
    PayOsProperties payOsProperties;
    ObjectProvider<PayOS> payOSProvider;

    ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public String processPayment(PaymentRequest request) {
        String gateway = normalizeGateway(request.getPaymentGateway());
        PaymentMethod paymentMethod = resolvePaymentMethod(request.getPaymentId(), gateway);
        TicketBooking ticketBooking = ticketBookingRepository.findTicketBookingByBookingID(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorHandler.BOOKING_INVALID));

        if (paymentMethod == null && gateway.isBlank()) {
            throw new AppException(ErrorHandler.PAYMENT_NULL);
        }
        if (!request.isSuccess()) {
            throw new AppException(ErrorHandler.PAYMENT_OUT_TIME);
        }
        if ("Cancelled".equalsIgnoreCase(ticketBooking.getStatus())) {
            throw new AppException(ErrorHandler.PAYMENT_OUT_TIME);
        }

        if (paymentMethod != null) {
            ticketBooking.setPaymentMethod(paymentMethod);
            ticketBookingRepository.save(ticketBooking);
        }

        String paymentType = paymentMethod != null
                ? canonicalGateway(paymentMethod.getType())
                : canonicalGateway(gateway);

        if ("VNPAY".equals(paymentType)) {
            try {
                return vnPayService.createPaymentUrl(request.getBookingId(), request.getTotalMoney(), request.getIpAddress());
            } catch (UnsupportedEncodingException e) {
                throw new RuntimeException("Lỗi cổng phương thức", e);
            }
        }

        if ("PAYOS".equals(paymentType)) {
            return createPayOsPaymentLink(ticketBooking, request.getTotalMoney());
        }

        throw new RuntimeException("Phương thức thanh toán chưa hỗ trợ");
    }

    @Override
    @Transactional
    public String resultPayment(PaymentResultRequest request) {
        if (isPayOsResult(request)) {
            return handlePayOsResult(request);
        }

        TicketBooking ticketBooking = ticketBookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorHandler.BOOKING_INVALID));

        boolean isPaymentSuccessful = "00".equals(request.getVnp_ResponseCode())
                && "00".equals(request.getVnp_TransactionStatus());

        if (isPaymentSuccessful) {
            finalizeSuccessfulPayment(ticketBooking, request.getTotalMoney(), request.getCouponCode(), request.getSelectedPromotionIds());
            return "Thanh toán thành công";
        }

        markBookingFailed(ticketBooking);
        return "Thanh toán thất bại";
    }

    @Override
    @Transactional
    public String mockSuccessPayment(MockPaymentRequest request) {
        if (request == null || request.getBookingId() == null || request.getCustomerId() == null) {
            throw new AppException(ErrorHandler.INVALID_INPUT, "Thiếu bookingId hoặc customerId");
        }

        TicketBooking ticketBooking = ticketBookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorHandler.BOOKING_INVALID));

        if (ticketBooking.getCustomer() == null
                || !request.getCustomerId().equals(ticketBooking.getCustomer().getCustomerID())) {
            throw new AppException(ErrorHandler.UNAUTHORIZED, "Bạn không có quyền thanh toán đơn này");
        }

        if ("Success".equalsIgnoreCase(ticketBooking.getStatus())) {
            return "Đơn đã được thanh toán trước đó";
        }

        if (!"pending".equalsIgnoreCase(ticketBooking.getStatus())) {
            throw new AppException(ErrorHandler.PAYMENT_OUT_TIME, "Đơn không còn ở trạng thái chờ thanh toán");
        }

        finalizeSuccessfulPayment(ticketBooking, ticketBooking.getTotalPrice(), null, null);
        return "Mock thanh toán thành công";
    }

    @Override
    @Transactional
    public Map<String, Object> handlePayOsWebhook(Map<String, Object> payload) {
        try {
            WebhookData verifiedData = verifyPayOsWebhook(payload);
            if (verifiedData == null) {
                return Map.of("code", "00", "message", "signature verification failed");
            }

            Map<String, Object> data = objectMapper.convertValue(verifiedData, Map.class);
            String orderCode = valueAsString(data.get("orderCode"));
            if (orderCode.isBlank()) {
                return Map.of("code", "00", "message", "orderCode missing");
            }

            TicketBooking booking = ticketBookingRepository.findByPayosOrderCode(orderCode)
                    .orElse(null);
            if (booking == null) {
                return Map.of("code", "00", "message", "booking not found");
            }

            String code = valueAsString(payload.get("code"));
            if (code.isBlank()) {
                code = valueAsString(data.get("code"));
            }
            String status = valueAsString(payload.get("status"));
            if (status.isBlank()) {
                status = valueAsString(data.get("status"));
            }

            boolean payOsSuccess = !isFailureStatus(status)
                    && ("00".equals(code) || isSuccessStatus(status));

            if (payOsSuccess) {
                finalizeSuccessfulPayment(booking, booking.getTotalPrice(), null, null);
                return Map.of("code", "00", "message", "success");
            }

            markBookingFailed(booking);
            return Map.of("code", "00", "message", "payment failed");
        } catch (Exception e) {
            return Map.of("code", "00", "message", "error");
        }
    }

    private String handlePayOsResult(PaymentResultRequest request) {
        TicketBooking ticketBooking = findBookingByPayOsRequest(request);

        boolean isPayOsSuccess = !isFailureStatus(request.getPayosStatus())
                && ("00".equals(request.getPayosCode())
                || isSuccessStatus(request.getPayosStatus()));

        if (isPayOsSuccess) {
            finalizeSuccessfulPayment(ticketBooking, request.getTotalMoney(), request.getCouponCode(), request.getSelectedPromotionIds());
            return "Thanh toán thành công";
        }

        markBookingFailed(ticketBooking);
        return "Thanh toán thất bại";
    }

    private TicketBooking findBookingByPayOsRequest(PaymentResultRequest request) {
        if (request.getPayosOrderCode() != null && !request.getPayosOrderCode().isBlank()) {
            TicketBooking byOrderCode = ticketBookingRepository.findByPayosOrderCode(request.getPayosOrderCode())
                    .orElse(null);
            if (byOrderCode != null) {
                return byOrderCode;
            }
        }

        if (request.getBookingId() != null) {
            return ticketBookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new AppException(ErrorHandler.BOOKING_INVALID));
        }

        throw new AppException(ErrorHandler.BOOKING_INVALID);
    }

    private void finalizeSuccessfulPayment(
            TicketBooking ticketBooking,
            Double paidTotal,
            String couponCode,
            List<Integer> selectedPromotionIds
    ) {
        if ("Success".equalsIgnoreCase(ticketBooking.getStatus())) {
            return;
        }

        Customer customer = ticketBooking.getCustomer();
        if (couponCode != null && !couponCode.isBlank()) {
            Coupon coupon = (Coupon) couponRepository.findByCode(couponCode)
                    .orElseThrow(() -> new AppException(ErrorHandler.COUPON_NOT_FOUND, "Mã coupon không tồn tại."));

            coupon.setUsedCount(coupon.getUsedCount() + 1);
            if (coupon.getUsageLimit() <= 0) {
                coupon.setIsActive(false);
                throw new AppException(ErrorHandler.COUPON_LIMIT_REACHED, "Mã coupon đã đạt giới hạn sử dụng.");
            }
            coupon.setUsageLimit(coupon.getUsageLimit() - 1);

            CouponUsage couponUsage = new CouponUsage();
            couponUsage.setCustomer(customer);
            couponUsage.setCoupon(coupon);
            couponUsage.setUsedAt(LocalDateTime.now());
            couponUsageRepository.save(couponUsage);
            couponRepository.save(coupon);
        }

        if (selectedPromotionIds != null && !selectedPromotionIds.isEmpty()) {
            for (Integer promotionId : selectedPromotionIds) {
                Promotion promotion = promotionRepository.findById(promotionId)
                        .orElseThrow(() -> new AppException(ErrorHandler.PROMOTION_NOT_FOUND, "Khuyến mãi không tồn tại."));
                promotionService.applyPromotion(promotion, customer);
            }
        }

        Movie movie = movieRepository.findById(ticketBooking.getShowtime().getMovie().getMovieID())
                .orElseThrow(() -> new AppException(ErrorHandler.MOVIE_NOT_EXISTED));

        if (movie.getTotalMoney() == null || movie.getTotalMoneyWithoutFood() == null
                || movie.getTotalMoneyFood() == null || movie.getTotalMoneyDiscount() == null) {
            movie.setTotalMoney(0.0);
            movie.setTotalMoneyWithoutFood(0.0);
            movie.setTotalMoneyFood(0.0);
            movie.setTotalMoneyDiscount(0.0);
            movie.setBuyFromScores(0.0);
            movieRepository.save(movie);
        }

        // Loyalty rules removed — skip point awarding
        Integer seller = ticketBooking.getShowtime().getMovie().getSeller();
        Double totalMoney = ticketBooking.getTotalPrice();
        Double totalMoneyWithoutFoodAndDiscount = ticketBooking.getTicketDetails().stream()
                .filter(booking -> booking.getBooking().getBookingID().equals(ticketBooking.getBookingID()))
                .mapToDouble(TicketDetail::getUnitPrice)
                .sum();
        Double totalMoneyFood = ticketBooking.getBookingFoodAndDrinks() == null ? 0.0 : ticketBooking.getBookingFoodAndDrinks().stream()
                .filter(booking -> booking.getBooking() != null && booking.getBooking().getBookingID().equals(ticketBooking.getBookingID()))
                .mapToDouble(food -> food.getQuantity() * (food.getUnitPrice() != null ? food.getUnitPrice() : 0.0))
                .sum();
        Double totalMoneyDiscount = ticketBooking.getShowtime().getMovie().getTotalMoneyWithoutFood()
                + ticketBooking.getShowtime().getMovie().getTotalMoneyFood()
                - ticketBooking.getShowtime().getMovie().getTotalMoney();

        ticketBooking.setStatus("Success");
        if (paidTotal != null && paidTotal > 0) {
            ticketBooking.setTotalPrice(paidTotal);
        }
        ticketBooking.getShowtime().getMovie().setSeller(seller + 1);
        ticketBooking.getShowtime().getMovie().setTotalMoney(ticketBooking.getShowtime().getMovie().getTotalMoney() + totalMoney);
        ticketBooking.getShowtime().getMovie().setTotalMoneyWithoutFood(ticketBooking.getShowtime().getMovie().getTotalMoneyWithoutFood() + totalMoneyWithoutFoodAndDiscount);
        ticketBooking.getShowtime().getMovie().setTotalMoneyFood(ticketBooking.getShowtime().getMovie().getTotalMoneyFood() + totalMoneyFood);
        ticketBooking.getShowtime().getMovie().setTotalMoneyDiscount(ticketBooking.getShowtime().getMovie().getTotalMoneyDiscount() + totalMoneyDiscount);

        // Loyalty rules removed — no point awarding

        ticketBookingRepository.save(ticketBooking);

        exportMovieDateService.updateExportMovieDate(
                movie,
                LocalDate.now(),
                totalMoney,
                totalMoneyWithoutFoodAndDiscount,
                totalMoneyDiscount,
                totalMoneyFood,
                0
        );
    }

    private void markBookingFailed(TicketBooking ticketBooking) {
        if ("Success".equalsIgnoreCase(ticketBooking.getStatus())) {
            return;
        }
        if ("Cancelled".equalsIgnoreCase(ticketBooking.getStatus())) {
            return;
        }

        ticketBooking.setStatus("Cancelled");
        List<TicketDetail> ticketDetails = ticketBooking.getTicketDetails();
        for (TicketDetail ticketDetail : ticketDetails) {
            ticketDetail.setCheckSeat("Blank");
        }
        ticketDetailRepository.saveAll(ticketDetails);
        ticketBookingRepository.save(ticketBooking);
    }

    private PaymentMethod resolvePaymentMethod(Integer paymentId, String paymentGateway) {
        if (paymentId != null) {
            return paymentMethodRepository.findById(Long.valueOf(paymentId)).orElse(null);
        }
        if (paymentGateway == null || paymentGateway.isBlank()) {
            return null;
        }
        String canonical = canonicalGateway(paymentGateway);
        if (canonical.isBlank()) {
            return null;
        }

        String displayType = "PAYOS".equals(canonical) ? "PayOS" : "VNPay";
        return paymentMethodRepository.findByTypeIgnoreCase(displayType)
                .orElseGet(() -> paymentMethodRepository.save(new PaymentMethod(
                        null,
                        displayType,
                        ""
                )));
    }

    private String normalizeGateway(String paymentGateway) {
        if (paymentGateway == null) {
            return "";
        }
        return paymentGateway.trim().replace("_", "").replace("-", "").toUpperCase(Locale.ROOT);
    }

    private String canonicalGateway(String paymentGateway) {
        String normalized = normalizeGateway(paymentGateway);
        if ("PAYOS".equals(normalized)) {
            return "PAYOS";
        }
        if ("VNPAY".equals(normalized)) {
            return "VNPAY";
        }
        return "";
    }

    private String createPayOsPaymentLink(TicketBooking ticketBooking, Double totalMoney) {
        PayOS payOS = requirePayOsClient();
        long orderCode = generateUniqueOrderCode();
        long amount = Math.round(totalMoney == null ? ticketBooking.getTotalPrice() : totalMoney);

        try {
            PaymentLinkItem item = PaymentLinkItem.builder()
                    .name("Thanh toan ve xem phim")
                    .quantity(1)
                    .price(amount)
                    .build();

            String bookingIdStr = String.valueOf(ticketBooking.getBookingID());
            CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                    .orderCode(orderCode)
                    .amount(amount)
                    .description("Booking " + ticketBooking.getBookingID())
                    .item(item)
                    .returnUrl(buildPayOsReturnUrl(payOsProperties.getTicketReturnUrl(), orderCode, "success", bookingIdStr))
                    .cancelUrl(buildPayOsReturnUrl(payOsProperties.getTicketCancelUrl(), orderCode, "cancel", bookingIdStr))
                    .build();

            CreatePaymentLinkResponse response = payOS.paymentRequests().create(paymentData);
            if (response.getCheckoutUrl() == null || response.getCheckoutUrl().isBlank()) {
                throw new RuntimeException("PAYOS did not return checkoutUrl");
            }

            ticketBooking.setPayosOrderCode(String.valueOf(orderCode));
            ticketBooking.setPayosPaymentLinkId(response.getPaymentLinkId());
            ticketBookingRepository.save(ticketBooking);
            return response.getCheckoutUrl();
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo link thanh toán PAYOS", e);
        }
    }

    private long generateUniqueOrderCode() {
        long orderCode = System.currentTimeMillis() / 1000;
        int attempts = 0;
        while (ticketBookingRepository.findByPayosOrderCode(String.valueOf(orderCode)).isPresent()) {
            orderCode++;
            attempts++;
            if (attempts > 10_000) {
                throw new RuntimeException("Không thể sinh orderCode duy nhất cho PAYOS");
            }
        }
        return orderCode;
    }

    private PayOS requirePayOsClient() {
        if (payOsProperties.getClientId() == null || payOsProperties.getClientId().isBlank()
                || payOsProperties.getApiKey() == null || payOsProperties.getApiKey().isBlank()
                || payOsProperties.getChecksumKey() == null || payOsProperties.getChecksumKey().isBlank()) {
            throw new RuntimeException("PAYOS chưa được cấu hình đầy đủ");
        }

        PayOS payOS = payOSProvider.getIfAvailable();
        if (payOS == null) {
            throw new RuntimeException("Không khởi tạo được PAYOS client");
        }
        return payOS;
    }

    private WebhookData verifyPayOsWebhook(Map<String, Object> payload) {
        PayOS payOS = payOSProvider.getIfAvailable();
        if (payOS == null) {
            return null;
        }
        try {
            return payOS.webhooks().verify(payload);
        } catch (Exception e) {
            return null;
        }
    }

    private boolean isPayOsResult(PaymentResultRequest request) {
        return (request.getPaymentGateway() != null && request.getPaymentGateway().equalsIgnoreCase("payos"))
                || (request.getPayosOrderCode() != null && !request.getPayosOrderCode().isBlank());
    }

    private String valueAsString(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private String buildPayOsReturnUrl(String baseUrl, long orderCode, String status, String id) {
        String query = "orderCode=" + orderCode + "&status=" + status + "&id=" + id + "&paymentGateway=payos";
        if (baseUrl == null || baseUrl.isBlank()) {
            return "http://localhost:5173/payment-success?" + query;
        }
        String normalized = baseUrl.trim();
        // If baseUrl already contains all required params, return it as is
        if (normalized.contains("orderCode=") && normalized.contains("status=") && normalized.contains("id=")) {
            return normalized;
        }
        // Otherwise, append missing query params
        return normalized + (normalized.contains("?") ? "&" : "?") + query;
    }

    private boolean isSuccessStatus(String status) {
        if (status == null) {
            return false;
        }
        String normalized = status.trim().toLowerCase();
        return "success".equals(normalized)
                || "succes".equals(normalized)
                || "paid".equals(normalized)
                || "succeeded".equals(normalized);
    }

    private boolean isFailureStatus(String status) {
        if (status == null) {
            return false;
        }
        String normalized = status.trim().toLowerCase();
        return "cancel".equals(normalized)
                || "cancelled".equals(normalized)
                || "canceled".equals(normalized)
                || "fail".equals(normalized)
                || "failed".equals(normalized)
                || "error".equals(normalized)
                || "expired".equals(normalized);
    }

    private String writeMetadata(Map<String, Object> payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    @Override
    public List<PaymentMethod> getAllPayment() {
        return paymentMethodRepository.findAll();
    }

    // Pay-by-points and exchange-point methods removed as feature is deleted

}
