package movie.swp391.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import movie.swp391.response.promotion.AppliedPromotionDto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingConfirmationResponse {
    private String movieName;
    private String screen;
    private LocalDate date;
    private LocalTime time;
    private List<SeatConfirmationInfo> seats;
    private Double totalPrice;
    private double priceAfterApplyPromotion;
    private String fullName;
    private String email;
    private String identityCard;
    private String phoneNumber;
    private List<AppliedPromotionDto> appliedPromotions;
    private List<FoodAndDrinkInfo> foodAndDrinks;
    private Double discountVip;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatConfirmationInfo {
        private Integer seatId;
        private String seatName;
        private String seatType;
        private Double price;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FoodAndDrinkInfo {
        private Integer id;
        private String name;
        private String type;
        private Double price;
        private String image;
        private Integer quantity;
    }
} 