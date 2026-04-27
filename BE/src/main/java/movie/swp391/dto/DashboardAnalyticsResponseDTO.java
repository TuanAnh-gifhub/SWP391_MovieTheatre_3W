package movie.swp391.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardAnalyticsResponseDTO {
    private String requestedFocusDate;
    private String effectiveFocusDate;
    private Boolean focusDateFallbackApplied;
    private DashboardKpiDTO kpi;
    private List<RevenueSplitPointDTO> revenueTrend;
    private List<MovieDensityItemDTO> movieDensity;
    private List<GenreAnalyticsItemDTO> genreAnalysis;
    private List<TimeSlotAnalyticsItemDTO> timeSlotAnalysis;
    private SeatAnalyticsDTO seatAnalysis;
    private List<OccupancyShowtimeItemDTO> occupancyByShowtime;
    private List<OccupancyCinemaItemDTO> occupancyByCinema;
    private List<AgeGroupAnalyticsItemDTO> ageGroups;
    private List<RevenueBreakdownItemDTO> revenueByGenre;
    private List<RevenueBreakdownItemDTO> revenueByTicketVolume;
    private List<RevenueBreakdownItemDTO> revenueByCustomer;
    // Tỷ lệ lấp đầy theo ngày (mỗi phần tử: date, fillRate(0..100))
    private List<DailyFillRateItemDTO> dailyFillRate;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardKpiDTO {
        private Double totalRevenue;
        private Long totalTicketsSold;
        private Long totalCustomers;
        private Long nowShowingMovies;
        private Double ticketRevenue;
        private Double foodRevenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueSplitPointDTO {
        private String label;
        private Double ticketRevenue;
        private Double foodRevenue;
        private Double totalRevenue;
        private Long ticketsSold;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MovieDensityItemDTO {
        private Integer movieId;
        private String movieTitle;
        private Long showCount;
        private String peakTimeSlot;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GenreAnalyticsItemDTO {
        private String genre;
        private Long showCount;
        private Long ticketsSold;
        private Double revenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimeSlotAnalyticsItemDTO {
        private String slot;
        private Long ticketsSold;
        private Double revenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SeatStatItemDTO {
        private Integer seatId;
        private String seatName;
        private String seatType;
        private String area;
        private Long bookedCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AreaOccupancyItemDTO {
        private String area;
        private Long bookedCount;
        private Long totalSeats;
        private Double occupancyRate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SeatAnalyticsDTO {
        private SeatStatItemDTO mostBookedSeat;
        private List<SeatStatItemDTO> topSeats;
        private List<AreaOccupancyItemDTO> areaOccupancy;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OccupancyShowtimeItemDTO {
        private Integer showtimeId;
        private String movieTitle;
        private String cinemaName;
        private String roomName;
        private String showDate;
        private String showTime;
        private Long soldSeats;
        private Long totalSeats;
        private Double occupancyRate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OccupancyCinemaItemDTO {
        private Integer cinemaId;
        private String cinemaName;
        private Long soldSeats;
        private Long totalSeats;
        private Double occupancyRate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AgeGroupAnalyticsItemDTO {
        private String ageGroup;
        private Long customers;
        private Long ticketsSold;
        private Double revenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueBreakdownItemDTO {
        private String label;
        private Long ticketCount;
        private Double revenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyFillRateItemDTO {
        private String date; // yyyy-MM-dd
        private Double fillRate; // percentage 0..100
    }
}

