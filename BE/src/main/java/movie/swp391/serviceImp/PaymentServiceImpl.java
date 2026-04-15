package movie.swp391.serviceImp;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.entity.*;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.repository.*;
import movie.swp391.request.*;
import movie.swp391.response.PayByPointResponse;
import movie.swp391.service.*;
import org.springframework.stereotype.Service;

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
    private final TicketDetailRepository ticketDetailRepository;
    ScoreHistoryRepository scoreHistoryRepository;
    LoyaltyRuleRepository loyaltyRuleRepository;
    CouponRepository couponRepository;
    CouponUsageRepository couponUsageRepository;
    MovieRepository movieRepository;
    PromotionRepository promotionRepository;
    PromotionService promotionService;
    ExportService exportMovieDateService;
    private final CustomerRepository customerRepository;
    PayPalServiceImpl payPalService;



    @Override
    @Transactional
    public String processPayment(PaymentRequest request) {
        // Tìm PaymentMethod bằng paymentId
        PaymentMethod paymentMethod = paymentMethodRepository.findById(Long.valueOf(request.getPaymentId())).orElse(null);
        TicketBooking ticketBooking = ticketBookingRepository.findTicketBookingByBookingID(request.getBookingId()).orElseThrow(() -> new AppException(ErrorHandler.BOOKING_INVALID));
        if (paymentMethod == null) {
            throw new AppException(ErrorHandler.PAYMENT_NULL);
        }
        if (!request.isSuccess()) {
            throw new AppException(ErrorHandler.PAYMENT_OUT_TIME);
        }
        if (ticketBooking.getStatus().equals("Cancelled")) {
            throw new AppException(ErrorHandler.PAYMENT_OUT_TIME);
        }
        ticketBooking.setPaymentMethod(paymentMethod);
        ticketBookingRepository.save(ticketBooking);
        String paymentUrl;

        if ("VNPay".equalsIgnoreCase(paymentMethod.getType())) {
            Integer orderId = request.getBookingId();
            Double amount = request.getTotalMoney();
            try {
                paymentUrl = vnPayService.createPaymentUrl(orderId, amount, request.getIpAddress());
                return paymentUrl;
            } catch (UnsupportedEncodingException e) {
                return "Lỗi cổng phương thức";
            }
        } else if ("PayPal".equalsIgnoreCase(paymentMethod.getType())) {
            Double amount = request.getTotalMoney()/25000;
            Double usdAmount = amount*25000;

            try {
                // Có thể lấy mô tả đơn hàng, cancelUrl, successUrl động nếu cần
                String description = "Thanh toán đơn hàng #" + request.getBookingId();
                String cancelUrl = "https://sixcinema.site/payment-cancel";
                String successUrl = "https://sixcinema.site/payment-success";
                paymentUrl = payPalService.createPaymentUrl(
                        amount,
                        "USD",
                        description,
                        cancelUrl,
                        successUrl
                );
                return paymentUrl;
            } catch (Exception e) {
                return "Lỗi cổng phương thức PayPal";
            }
        } else {
            return "Phương thức thanh toán chưa hỗ trợ";
        }
    }

    @Override
    public String resultPayment(PaymentResultRequest request) {
        // Tìm booking theo bookingId
        TicketBooking ticketBooking = ticketBookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorHandler.BOOKING_INVALID));
        boolean isPaymentSuccessful = false;
        if ("00".equals(request.getVnp_ResponseCode()) && "00".equals(request.getVnp_TransactionStatus())) {
            isPaymentSuccessful = true;
        }

        if (isPaymentSuccessful) {

            Customer customer = ticketBooking.getCustomer();
            if (request.getCouponCode()!=null) {
                Coupon coupon = (Coupon) couponRepository.findByCode(request.getCouponCode())
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
            if (request.getSelectedPromotionIds() != null && !request.getSelectedPromotionIds().isEmpty()) {
                List<Promotion> promotions = new ArrayList<>();
                for (Integer promotionId : request.getSelectedPromotionIds()) {
                    Promotion promotion = promotionRepository.findById(promotionId)
                            .orElseThrow(() -> new AppException(ErrorHandler.PROMOTION_NOT_FOUND, "Khuyến mãi không tồn tại."));
                    promotionService.applyPromotion(promotion, customer);

                }
            }

            Movie movie = movieRepository.findById(ticketBooking.getShowtime().getMovie().getMovieID()).orElseThrow(() -> new AppException(ErrorHandler.MOVIE_NOT_EXISTED));
            if (movie.getTotalMoney() ==null || movie.getTotalMoneyWithoutFood()==null || movie.getTotalMoneyFood()==null || movie.getTotalMoneyDiscount()==null){
                movie.setTotalMoney(0.0);
                movie.setTotalMoneyWithoutFood(0.0);
                movie.setTotalMoneyFood(0.0);
                movie.setTotalMoneyDiscount(0.0);
                movie.setBuyFromScores(0.0);
                movieRepository.save(movie);
            }
            LoyaltyRule rule = loyaltyRuleRepository.findAll().stream()
                    .filter(LoyaltyRule::getIsActive)
                    .findFirst()
                    .orElse(null);
            Integer seller =ticketBooking.getShowtime().getMovie().getSeller();
            Double totalMoney = ticketBooking.getTotalPrice();
            Double totalMoneyWithoutFoodAndDiscount = ticketBooking.getTicketDetails().stream().filter(booking -> booking.getBooking().getBookingID().equals(request.getBookingId())).mapToDouble(TicketDetail::getUnitPrice).sum();
            Double totalMoneyFood = ticketBooking.getBookingFoodAndDrinks().stream().filter(booking -> booking.getBooking().getBookingID().equals(request.getBookingId())).mapToDouble(food -> food.getQuantity()*food.getFoodAndDrink().getPrice()).sum();
            Double totalMoneyDiscount =ticketBooking.getShowtime().getMovie().getTotalMoneyWithoutFood()+ticketBooking.getShowtime().getMovie().getTotalMoneyFood()-ticketBooking.getShowtime().getMovie().getTotalMoney();
            ticketBooking.setStatus("Success");
            ticketBooking.setTotalPrice(request.getTotalMoney());
            ticketBooking.getShowtime().getMovie().setSeller(seller+1);
            ticketBooking.getShowtime().getMovie().setTotalMoney(ticketBooking.getShowtime().getMovie().getTotalMoney()+totalMoney);
            ticketBooking.getShowtime().getMovie().setTotalMoneyWithoutFood(ticketBooking.getShowtime().getMovie().getTotalMoneyWithoutFood()+totalMoneyWithoutFoodAndDiscount);
            ticketBooking.getShowtime().getMovie().setTotalMoneyFood(ticketBooking.getShowtime().getMovie().getTotalMoneyFood()+totalMoneyFood);
            ticketBooking.getShowtime().getMovie().setTotalMoneyDiscount(ticketBooking.getShowtime().getMovie().getTotalMoneyDiscount()+totalMoneyDiscount);
            ticketBookingRepository.save(ticketBooking);
            if (rule != null) {
                ScoreHistory successHistory = new ScoreHistory();
                successHistory.setCustomer(customer);
                successHistory.setActionType("plus");
                successHistory.setDate(LocalDateTime.now());
                double n = request.getTotalMoney() * rule.getPointsEarned() / rule.getPointsPerAmount();
                successHistory.setAmount((int) Math.floor(n));
                ticketBooking.setConvertedScore((int) Math.floor(n));
                successHistory.setNote("Thanh toán thành công");
                customer.getScoreHistories().add(successHistory);
                scoreHistoryRepository.save(successHistory);

            }

            exportMovieDateService.updateExportMovieDate(
                    movie,
                    LocalDate.now(),
                    totalMoney,
                    totalMoneyWithoutFoodAndDiscount,
                    totalMoneyDiscount,
                    totalMoneyFood,
                    0);

            return "Thanh toán thành công";



        } else {
            ticketBooking.setStatus("Cancelled");

            List<TicketDetail> ticketDetails = ticketBooking.getTicketDetails();
            for (TicketDetail ticketDetail : ticketDetails) {
                ticketDetail.setCheckSeat("Blank");

            }
            ticketDetailRepository.saveAll(ticketDetails);
            ticketBookingRepository.save(ticketBooking);

            return "Thanh toán thất bại";
        }
    }

    @Override
    public List<PaymentMethod> getAllPayment(){
        List<PaymentMethod> paymentMethods = paymentMethodRepository.findAll();
        return paymentMethods;
    }
    @Override

    public PayByPointResponse payByPointsShow(PayByPointRequest request){
        LoyaltyRule rule = loyaltyRuleRepository.findAll().stream()
                .filter(LoyaltyRule::getIsActive)
                .findFirst()
                .orElse(null);
        if (rule==null){ throw new AppException(ErrorHandler.FUNCTION_NOT_FOUND,"Chức năng này không được hỗ trợ");}
        double pointToMoney = request.getPoint()*rule.getMoneyReturn();
        Integer moneyToPoint =(int) (request.getTotalMoney()/ rule.getMoneyReturn());
        if(pointToMoney>=request.getTotalMoney()){
            return PayByPointResponse.builder()
                    .message("Bạn đã đủ điểm để thanh toán, điểm cần :"+moneyToPoint)
                    .pointNeed(moneyToPoint)
                    .isSuccess(true)
                    .build();
        }

        else throw new AppException(ErrorHandler.PAY_NOT_ENOUGH_POINT,"Bạn chưa đủ điểm để thanh toán, bạn cần thêm "+(moneyToPoint-request.getPoint())+" điểm");

    }
    @Override
    public String resultPaymentByPoint(ResultPayByPointRequest request){
        LoyaltyRule rule = loyaltyRuleRepository.findAll().stream()
                .filter(LoyaltyRule::getIsActive)
                .findFirst()
                .orElse(null);
        if (rule==null || rule.getMoneyReturn()==null){ throw new AppException(ErrorHandler.FUNCTION_NOT_FOUND,"Chức năng này không được hỗ trợ");}
        TicketBooking ticketBooking = ticketBookingRepository.findById(request.getBookingId()).orElseThrow(() -> new AppException(ErrorHandler.BOOKING_INVALID));
        Movie movie = ticketBooking.getShowtime().getMovie();
        if (movie.getBuyFromScores()==null){
            movie.setBuyFromScores(0.0);
            movieRepository.save(movie);
        }
        ticketBooking.setStatus("Success");
        ticketBooking.setTotalPrice(0.0);
        ticketBooking.setConvertedScore(-request.getPoint());
        Customer customer = ticketBooking.getCustomer();
        ScoreHistory successHistory = new ScoreHistory();
        successHistory.setCustomer(customer);
        successHistory.setActionType("minus");
        successHistory.setDate(LocalDateTime.now());
        successHistory.setAmount(request.getPoint() );
        successHistory.setNote("Thanh toán bằng điểm thành công");
        ticketBooking.getShowtime().getMovie().setSeller(ticketBooking.getShowtime().getMovie().getSeller()+1);
        ticketBooking.getShowtime().getMovie().setBuyFromScores(ticketBooking.getShowtime().getMovie().getBuyFromScores()+request.getPoint()*rule.getMoneyReturn());
        exportMovieDateService.updateExportMovieDate(
                movie,
                LocalDate.now(),
                0,
                0,
                0,
                0,
                request.getPoint()*rule.getMoneyReturn());
        ticketBookingRepository.save(ticketBooking);
        scoreHistoryRepository.save(successHistory);
        return "Đã thanh toán bằng điểm thành công";


    }

    @Override
    @Transactional
    public String exchangePointForMoneyPlus(OutOfFoodReturnPointRequest request) {
        if (request.getCustomerId() == null || request.getMoney() == null || request.getMoney() <= 0) {
            throw new AppException(ErrorHandler.INVALID_INPUT);
        }
        // Tìm customer
        Customer customer = customerRepository.findById(request.getCustomerId()).orElseThrow(() -> new AppException(ErrorHandler.CUSTOMER_NOT_FOUND));

        LoyaltyRule rule = loyaltyRuleRepository.findAll().stream()
                .filter(LoyaltyRule::getIsActive)
                .findFirst()
                .orElse(null);
        if (rule==null || rule.getMoneyReturn()==null){ throw new AppException(ErrorHandler.FUNCTION_NOT_FOUND,"Chức năng này không được hỗ trợ");}    ScoreHistory history = new ScoreHistory();
        history.setCustomer(customer);
        history.setAmount((int) Math.round(request.getMoney()/rule.getMoneyReturn())); // Giả sử amount kiểu Long
        history.setDate(LocalDateTime.now());
        history.setActionType("plus");
        history.setNote("Đổi điểm khi hết đồ ăn thức uống");

        scoreHistoryRepository.save(history);



        return "Đổi điểm thành công với khách hàng : "+ customer.getFullName()+ " và số điểm: " + Math.round(request.getMoney()/rule.getMoneyReturn());
    }


}
