package movie.swp391.service;

import movie.swp391.dto.*;
import movie.swp391.dto.DashboardAnalyticsResponseDTO.*;
import movie.swp391.repository.TicketBookingRepository;
import movie.swp391.repository.CustomerRepository;
import movie.swp391.repository.MovieRepository;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class DashboardService {

    private final TicketBookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final MovieRepository movieRepository;
    private final EntityManager em;

    public DashboardService(TicketBookingRepository bookingRepository, CustomerRepository customerRepository, MovieRepository movieRepository, EntityManager em) {
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
        this.movieRepository = movieRepository;
        this.em = em;
    }

    public DashboardSummaryDTO getSummary(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(23,59,59);

        // total revenue (scalar)
        Object revObj = em.createNativeQuery("SELECT ISNULL(SUM(total_price),0) FROM TicketBookings WHERE bookingDate BETWEEN :start AND :end")
                .setParameter("start", start)
                .setParameter("end", end)
                .getSingleResult();
        Double totalRevenue = 0.0;
        if (revObj instanceof Number) {
            totalRevenue = ((Number) revObj).doubleValue();
        } else if (revObj != null) {
            try {
                totalRevenue = Double.parseDouble(revObj.toString());
            } catch (NumberFormatException ignored) {}
        }

        // total orders
        Object ordersObj = em.createNativeQuery("SELECT COUNT(1) FROM TicketBookings WHERE bookingDate BETWEEN :start AND :end")
                .setParameter("start", start)
                .setParameter("end", end)
                .getSingleResult();
        Long totalOrders = 0L;
        if (ordersObj instanceof Number) totalOrders = ((Number) ordersObj).longValue();

        // total customers
        Long totalCustomers = customerRepository.count();

        // total products -> use Movie count as proxy
        Long totalProducts = movieRepository.count();

        return new DashboardSummaryDTO(java.math.BigDecimal.valueOf(totalRevenue), totalOrders, totalCustomers, totalProducts);
    }

    public List<RevenuePointDTO> getRevenueByRange(LocalDate from, LocalDate to, String range) {
        // For SQL Server use FORMAT(bookingDate, 'yyyy-MM-dd') or CONVERT(VARCHAR(10), bookingDate, 23)
        String sqlLabel = "CONVERT(varchar(10), bookingDate, 23)"; // yyyy-mm-dd
        if("year".equalsIgnoreCase(range)) {
            sqlLabel = "FORMAT(bookingDate, 'yyyy-MM')";
        } else if("month".equalsIgnoreCase(range)) {
            sqlLabel = "CONVERT(varchar(10), bookingDate, 23)";
        }

        String sql = String.format("SELECT %s as dt, ISNULL(SUM(total_price),0) as revenue FROM TicketBookings WHERE bookingDate BETWEEN :start AND :end GROUP BY %s ORDER BY %s", sqlLabel, sqlLabel, sqlLabel);
        Query q = em.createNativeQuery(sql);
        q.setParameter("start", from.atStartOfDay());
        q.setParameter("end", to.atTime(23,59,59));
        @SuppressWarnings("unchecked")
        List<Object[]> rows = q.getResultList();
        List<RevenuePointDTO> out = new ArrayList<>();
        for(Object[] r : rows){
            String dateLabel = r[0] != null ? r[0].toString() : "";
            Double rev = r[1] != null ? ((Number) r[1]).doubleValue() : 0.0;
            out.add(new RevenuePointDTO(dateLabel, rev));
        }
        return out;
    }

    public List<SalesSummaryDTO> getSalesSummary(LocalDate from, LocalDate to) {
        // Example grouping by movie title
        String sql2 = "SELECT movie_title, COUNT(1) AS orders, ISNULL(SUM(total_price),0) AS revenue FROM TicketBookings WHERE bookingDate BETWEEN :start AND :end GROUP BY movie_title ORDER BY revenue DESC";
        Query q = em.createNativeQuery(sql2);
        q.setParameter("start", from.atStartOfDay());
        q.setParameter("end", to.atTime(23,59,59));
        @SuppressWarnings("unchecked")
        List<Object[]> rows = q.getResultList();
        List<SalesSummaryDTO> out = new ArrayList<>();
        for(Object[] r : rows){
            String cat = r[0] != null ? r[0].toString() : "Unknown";
            Long orders = r[1] != null ? ((Number) r[1]).longValue() : 0L;
            Double rev = r[2] != null ? ((Number) r[2]).doubleValue() : 0.0;
            out.add(new SalesSummaryDTO(cat, orders, rev));
        }
        return out;
    }

    public List<CustomerAnalyticsDTO> getCustomerAnalytics(LocalDate from, LocalDate to) {
        String sql3 = "SELECT c.customerID, c.full_name, COUNT(b.bookingID) AS totalOrders, ISNULL(SUM(b.total_price),0) AS totalSpent FROM customers c LEFT JOIN TicketBookings b ON c.customerID = b.customerID AND b.bookingDate BETWEEN :start AND :end GROUP BY c.customerID, c.full_name ORDER BY totalSpent DESC";
        Query q = em.createNativeQuery(sql3);
        q.setParameter("start", from.atStartOfDay());
        q.setParameter("end", to.atTime(23,59,59));
        @SuppressWarnings("unchecked")
        List<Object[]> rows = q.getResultList();
        List<CustomerAnalyticsDTO> out = new ArrayList<>();
        for(Object[] r : rows){
            Integer id = r[0] != null ? ((Number) r[0]).intValue() : null;
            String name = r[1] != null ? r[1].toString() : "";
            Long orders = r[2] != null ? ((Number) r[2]).longValue() : 0L;
            Double spent = r[3] != null ? ((Number) r[3]).doubleValue() : 0.0;
            out.add(new CustomerAnalyticsDTO(id, name, orders, spent));
        }
        return out;
    }

    public byte[] exportSalesSummary(String format, LocalDate from, LocalDate to) {
        // simple CSV generator; for PDF integrate iText/OpenPDF if needed
        List<SalesSummaryDTO> rows = getSalesSummary(from, to);
        StringBuilder sb = new StringBuilder();
        sb.append("Category,OrderVolume,Revenue\n");
        for(SalesSummaryDTO s : rows){
            String cat = s.getCategory() == null ? "" : s.getCategory();
            // escape double quotes by doubling them for CSV
            cat = cat.replace("\"","\"\"");
            sb.append('"').append(cat).append('"')
                    .append(',').append(s.getOrderVolume()).append(',').append(s.getRevenue()).append('\n');
        }
        return sb.toString().getBytes();
    }

    public DashboardAnalyticsResponseDTO getAnalyticsOverview(LocalDate startDate, LocalDate endDate, String revenueGroupBy, LocalDate focusDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        LocalDate requestedFocusDate = focusDate != null ? focusDate : endDate;
        LocalDate effectiveFocusDate = resolveEffectiveFocusDate(requestedFocusDate, startDate, endDate);

        DashboardKpiDTO kpi = buildKpi(start, end);
        List<RevenueSplitPointDTO> revenueTrend = buildRevenueTrend(start, end, revenueGroupBy);
        List<MovieDensityItemDTO> movieDensity = buildMovieDensity(effectiveFocusDate);
        List<GenreAnalyticsItemDTO> genreAnalysis = buildGenreAnalysis(startDate, endDate);
        List<TimeSlotAnalyticsItemDTO> timeSlotAnalysis = buildTimeSlotAnalysis(startDate, endDate);
        SeatAnalyticsDTO seatAnalysis = buildSeatAnalysis(start, end);
        List<DailyFillRateItemDTO> dailyFillRate = buildDailyFillRate(startDate, endDate);
        List<OccupancyShowtimeItemDTO> occupancyByShowtime = buildOccupancyByShowtime(startDate, endDate);
        List<OccupancyCinemaItemDTO> occupancyByCinema = buildOccupancyByCinema(occupancyByShowtime);
        List<AgeGroupAnalyticsItemDTO> ageGroups = buildAgeGroupAnalysis(start, end);
        List<RevenueBreakdownItemDTO> revenueByGenre = buildRevenueByGenre(genreAnalysis);
        List<RevenueBreakdownItemDTO> revenueByTicketVolume = buildRevenueByTicketVolume(start, end);
        List<RevenueBreakdownItemDTO> revenueByCustomer = buildRevenueByCustomer(start, end);

        return DashboardAnalyticsResponseDTO.builder()
                .requestedFocusDate(requestedFocusDate != null ? requestedFocusDate.toString() : null)
                .effectiveFocusDate(effectiveFocusDate != null ? effectiveFocusDate.toString() : null)
                .focusDateFallbackApplied(!requestedFocusDate.equals(effectiveFocusDate))
                .kpi(kpi)
                .revenueTrend(revenueTrend)
                .movieDensity(movieDensity)
                .genreAnalysis(genreAnalysis)
                .timeSlotAnalysis(timeSlotAnalysis)
                .seatAnalysis(seatAnalysis)
                .occupancyByShowtime(occupancyByShowtime)
                .occupancyByCinema(occupancyByCinema)
                .ageGroups(ageGroups)
                .revenueByGenre(revenueByGenre)
                .revenueByTicketVolume(revenueByTicketVolume)
                .revenueByCustomer(revenueByCustomer)
                .dailyFillRate(dailyFillRate)
                .build();
    }

    private LocalDate resolveEffectiveFocusDate(LocalDate requestedFocusDate, LocalDate startDate, LocalDate endDate) {
        if (requestedFocusDate == null) {
            return endDate;
        }

        List<LocalDate> datesInRange = em.createQuery(
                        "SELECT DISTINCT s.date FROM Showtime s WHERE s.date BETWEEN :startDate AND :endDate", LocalDate.class)
                .setParameter("startDate", startDate)
                .setParameter("endDate", endDate)
                .getResultList();

        LocalDate nearestInRange = findNearestDate(requestedFocusDate, datesInRange);
        if (nearestInRange != null) {
            return nearestInRange;
        }

        List<LocalDate> allDates = em.createQuery(
                        "SELECT DISTINCT s.date FROM Showtime s", LocalDate.class)
                .getResultList();

        LocalDate nearestOverall = findNearestDate(requestedFocusDate, allDates);
        return nearestOverall != null ? nearestOverall : requestedFocusDate;
    }

    private LocalDate findNearestDate(LocalDate requestedDate, List<LocalDate> candidateDates) {
        if (candidateDates == null || candidateDates.isEmpty()) {
            return null;
        }

        return candidateDates.stream()
                .min(Comparator
                        .comparingLong((LocalDate d) -> Math.abs(ChronoUnit.DAYS.between(requestedDate, d)))
                        // If same distance, prefer a future or same-day date for better UX.
                        .thenComparing(d -> d.isBefore(requestedDate)))
                .orElse(null);
    }

    private DashboardKpiDTO buildKpi(LocalDateTime start, LocalDateTime end) {
        Object[] ticketAgg = (Object[]) em.createQuery(
                        "SELECT COALESCE(SUM(td.unitPrice),0), COUNT(td.ticketDetailID) " +
                                "FROM TicketDetail td JOIN td.booking tb " +
                                "WHERE LOWER(tb.status) = 'success' AND tb.bookingDate BETWEEN :start AND :end")
                .setParameter("start", start)
                .setParameter("end", end)
                .getSingleResult();

        Double ticketRevenue = asDouble(ticketAgg[0]);
        Long totalTickets = asLong(ticketAgg[1]);

        Double foodRevenue = asDouble(
                em.createQuery(
                                "SELECT COALESCE(SUM(bfd.quantity * fd.price),0) " +
                                        "FROM BookingFoodAndDrink bfd JOIN bfd.booking tb JOIN bfd.foodAndDrink fd " +
                                        "WHERE LOWER(tb.status) = 'success' AND tb.bookingDate BETWEEN :start AND :end")
                        .setParameter("start", start)
                        .setParameter("end", end)
                        .getSingleResult()
        );

        Long totalCustomers = asLong(
                em.createQuery(
                                "SELECT COUNT(DISTINCT tb.customer.customerID) FROM TicketBooking tb " +
                                        "WHERE LOWER(tb.status) = 'success' AND tb.bookingDate BETWEEN :start AND :end")
                        .setParameter("start", start)
                        .setParameter("end", end)
                        .getSingleResult()
        );

        Long nowShowingMovies = asLong(
                em.createQuery(
                                "SELECT COUNT(m) FROM Movie m " +
                                        "WHERE m.active = true AND m.movieStatusPeriod IS NOT NULL " +
                                        "AND m.movieStatusPeriod.fromDate <= :today AND m.movieStatusPeriod.toDate >= :today")
                        .setParameter("today", LocalDate.now())
                        .getSingleResult()
        );

        return DashboardKpiDTO.builder()
                .totalRevenue(ticketRevenue + foodRevenue)
                .ticketRevenue(ticketRevenue)
                .foodRevenue(foodRevenue)
                .totalTicketsSold(totalTickets)
                .totalCustomers(totalCustomers)
                .nowShowingMovies(nowShowingMovies)
                .build();
    }

    private List<RevenueSplitPointDTO> buildRevenueTrend(LocalDateTime start, LocalDateTime end, String revenueGroupBy) {
        List<Object[]> ticketRows = em.createQuery(
                        "SELECT tb.bookingID, tb.bookingDate, COALESCE(SUM(td.unitPrice),0), COUNT(td.ticketDetailID) " +
                                "FROM TicketDetail td JOIN td.booking tb " +
                                "WHERE LOWER(tb.status) = 'success' AND tb.bookingDate BETWEEN :start AND :end " +
                                "GROUP BY tb.bookingID, tb.bookingDate", Object[].class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();

        Map<Integer, Double> foodByBooking = new HashMap<>();
        List<Object[]> foodRows = em.createQuery(
                        "SELECT tb.bookingID, COALESCE(SUM(bfd.quantity * fd.price),0) " +
                                "FROM BookingFoodAndDrink bfd JOIN bfd.booking tb JOIN bfd.foodAndDrink fd " +
                                "WHERE LOWER(tb.status) = 'success' AND tb.bookingDate BETWEEN :start AND :end " +
                                "GROUP BY tb.bookingID", Object[].class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();

        for (Object[] row : foodRows) {
            foodByBooking.put(asInt(row[0]), asDouble(row[1]));
        }

        Map<String, RevenueSplitPointDTO> grouped = new HashMap<>();
        for (Object[] row : ticketRows) {
            Integer bookingId = asInt(row[0]);
            LocalDateTime bookingDate = (LocalDateTime) row[1];
            Double ticketRevenue = asDouble(row[2]);
            Long ticketsSold = asLong(row[3]);
            Double foodRevenue = foodByBooking.getOrDefault(bookingId, 0.0);

            String label = toGroupLabel(bookingDate.toLocalDate(), revenueGroupBy);
            RevenueSplitPointDTO current = grouped.getOrDefault(label, RevenueSplitPointDTO.builder()
                    .label(label)
                    .ticketRevenue(0.0)
                    .foodRevenue(0.0)
                    .totalRevenue(0.0)
                    .ticketsSold(0L)
                    .build());

            current.setTicketRevenue(current.getTicketRevenue() + ticketRevenue);
            current.setFoodRevenue(current.getFoodRevenue() + foodRevenue);
            current.setTotalRevenue(current.getTotalRevenue() + ticketRevenue + foodRevenue);
            current.setTicketsSold(current.getTicketsSold() + ticketsSold);
            grouped.put(label, current);
        }

        return grouped.values().stream()
                .sorted(Comparator.comparing(RevenueSplitPointDTO::getLabel))
                .toList();
    }

    private List<MovieDensityItemDTO> buildMovieDensity(LocalDate focusDate) {
        List<Object[]> rows = em.createQuery(
                        "SELECT s.movie.movieID, s.movie.title, s.time " +
                                "FROM Showtime s WHERE s.date = :focusDate", Object[].class)
                .setParameter("focusDate", focusDate)
                .getResultList();

        Map<Integer, String> titleByMovie = new HashMap<>();
        Map<Integer, Long> countByMovie = new HashMap<>();
        Map<Integer, Map<String, Long>> peakByMovie = new HashMap<>();

        for (Object[] row : rows) {
            Integer movieId = asInt(row[0]);
            String title = row[1] == null ? "Unknown" : row[1].toString();
            LocalTime time = (LocalTime) row[2];
            String hourLabel = String.format("%02d:00", time.getHour());

            titleByMovie.put(movieId, title);
            countByMovie.put(movieId, countByMovie.getOrDefault(movieId, 0L) + 1);

            Map<String, Long> slotMap = peakByMovie.getOrDefault(movieId, new HashMap<>());
            slotMap.put(hourLabel, slotMap.getOrDefault(hourLabel, 0L) + 1);
            peakByMovie.put(movieId, slotMap);
        }

        List<MovieDensityItemDTO> out = new ArrayList<>();
        for (Map.Entry<Integer, Long> entry : countByMovie.entrySet()) {
            Integer movieId = entry.getKey();
            String peakSlot = peakByMovie.get(movieId).entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("N/A");

            out.add(MovieDensityItemDTO.builder()
                    .movieId(movieId)
                    .movieTitle(titleByMovie.get(movieId))
                    .showCount(entry.getValue())
                    .peakTimeSlot(peakSlot)
                    .build());
        }

        out.sort(Comparator.comparing(MovieDensityItemDTO::getShowCount).reversed());
        return out;
    }

    private List<GenreAnalyticsItemDTO> buildGenreAnalysis(LocalDate startDate, LocalDate endDate) {
        List<Object[]> rows = em.createQuery(
                        "SELECT COALESCE(s.movie.genre, 'Unknown'), COUNT(DISTINCT s.showtimeID), " +
                                "SUM(CASE WHEN LOWER(tb.status) = 'success' THEN 1 ELSE 0 END), " +
                                "COALESCE(SUM(CASE WHEN LOWER(tb.status) = 'success' THEN td.unitPrice ELSE 0 END), 0) " +
                                "FROM Showtime s LEFT JOIN s.bookings tb LEFT JOIN tb.ticketDetails td " +
                                "WHERE s.date BETWEEN :startDate AND :endDate " +
                                "GROUP BY s.movie.genre", Object[].class)
                .setParameter("startDate", startDate)
                .setParameter("endDate", endDate)
                .getResultList();

        List<GenreAnalyticsItemDTO> out = new ArrayList<>();
        for (Object[] row : rows) {
            out.add(GenreAnalyticsItemDTO.builder()
                    .genre(row[0] == null ? "Unknown" : row[0].toString())
                    .showCount(asLong(row[1]))
                    .ticketsSold(asLong(row[2]))
                    .revenue(asDouble(row[3]))
                    .build());
        }

        out.sort(Comparator.comparing(GenreAnalyticsItemDTO::getRevenue).reversed());
        return out;
    }

    private List<TimeSlotAnalyticsItemDTO> buildTimeSlotAnalysis(LocalDate startDate, LocalDate endDate) {
        List<Object[]> rows = em.createQuery(
                        "SELECT s.time, " +
                                "SUM(CASE WHEN LOWER(tb.status) = 'success' THEN 1 ELSE 0 END), " +
                                "COALESCE(SUM(CASE WHEN LOWER(tb.status) = 'success' THEN td.unitPrice ELSE 0 END), 0) " +
                                "FROM Showtime s LEFT JOIN s.bookings tb LEFT JOIN tb.ticketDetails td " +
                                "WHERE s.date BETWEEN :startDate AND :endDate " +
                                "GROUP BY s.time", Object[].class)
                .setParameter("startDate", startDate)
                .setParameter("endDate", endDate)
                .getResultList();

        Map<String, TimeSlotAnalyticsItemDTO> grouped = new HashMap<>();
        grouped.put("SANG", TimeSlotAnalyticsItemDTO.builder().slot("SANG").ticketsSold(0L).revenue(0.0).build());
        grouped.put("CHIEU", TimeSlotAnalyticsItemDTO.builder().slot("CHIEU").ticketsSold(0L).revenue(0.0).build());
        grouped.put("TOI", TimeSlotAnalyticsItemDTO.builder().slot("TOI").ticketsSold(0L).revenue(0.0).build());

        for (Object[] row : rows) {
            LocalTime time = (LocalTime) row[0];
            Long tickets = asLong(row[1]);
            Double revenue = asDouble(row[2]);

            String slot = classifyTimeSlot(time);
            TimeSlotAnalyticsItemDTO current = grouped.get(slot);
            current.setTicketsSold(current.getTicketsSold() + tickets);
            current.setRevenue(current.getRevenue() + revenue);
        }

        return new ArrayList<>(grouped.values());
    }

    private SeatAnalyticsDTO buildSeatAnalysis(LocalDateTime start, LocalDateTime end) {
        // Aggregate by zone/area instead of individual seat
        List<Object[]> seatRows = em.createQuery(
                        "SELECT s.seatID, s.seatName, s.seatType, s.row, s.column, " +
                                "SUM(CASE WHEN LOWER(tb.status) = 'success' THEN 1 ELSE 0 END) " +
                                "FROM Seat s " +
                                "LEFT JOIN s.ticketDetails td " +
                                "LEFT JOIN td.booking tb " +
                                "WHERE tb IS NULL OR tb.bookingDate BETWEEN :start AND :end " +
                                "GROUP BY s.seatID, s.seatName, s.seatType, s.row, s.column", Object[].class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();

        Map<String, Long> totalSeatsByArea = new HashMap<>();
        Map<String, Long> soldSeatsByArea = new HashMap<>();

        for (Object[] row : seatRows) {
            String seatType = row[2] == null ? "STANDARD" : row[2].toString();
            Integer col = row[4] == null ? null : asInt(row[4]);
            Long booked = asLong(row[5]);

            String area = classifySeatArea(seatType, col);

            // count total seats per area (each seat row represents one seat)
            totalSeatsByArea.put(area, totalSeatsByArea.getOrDefault(area, 0L) + 1);
            soldSeatsByArea.put(area, soldSeatsByArea.getOrDefault(area, 0L) + booked);
        }

        List<SeatStatItemDTO> aggregated = new ArrayList<>();
        for (Map.Entry<String, Long> e : soldSeatsByArea.entrySet()) {
            String area = e.getKey();
            Long booked = e.getValue();
            aggregated.add(SeatStatItemDTO.builder()
                    .seatId(0)
                    .seatName(area) // use seatName to carry zone label
                    .seatType(area)
                    .area(area)
                    .bookedCount(booked)
                    .build());
        }

        aggregated.sort(Comparator.comparing(SeatStatItemDTO::getBookedCount).reversed());
        SeatStatItemDTO topSeat = aggregated.isEmpty() ? null : aggregated.get(0);

        // Compute total seat-opportunities per area: sum over showtimes (for each showtime, number of seats in that room that belong to area)
        // 1) seat counts per room & area
        List<Object[]> seatCountRows = em.createQuery(
                        "SELECT cr.cinemaRoomID, " +
                                "CASE WHEN s.seatType = 'VIP' THEN 'VIP' WHEN s.column <= 2 OR s.column >= 10 THEN 'GOC' ELSE 'HANG_GIUA' END, " +
                                "COUNT(s) " +
                                "FROM Seat s JOIN s.cinemaRoom cr GROUP BY cr.cinemaRoomID, " +
                                "CASE WHEN s.seatType = 'VIP' THEN 'VIP' WHEN s.column <= 2 OR s.column >= 10 THEN 'GOC' ELSE 'HANG_GIUA' END", Object[].class)
                .getResultList();

        Map<Integer, Map<String, Long>> seatCountPerRoom = new HashMap<>();
        for (Object[] r : seatCountRows) {
            Integer roomId = asInt(r[0]);
            String area = r[1] == null ? "HANG_GIUA" : r[1].toString();
            Long cnt = asLong(r[2]);
            Map<String, Long> m = seatCountPerRoom.getOrDefault(roomId, new HashMap<>());
            m.put(area, cnt);
            seatCountPerRoom.put(roomId, m);
        }

        // 2) showtime counts per room in the range
        java.time.LocalDate startDate = start.toLocalDate();
        java.time.LocalDate endDate = end.toLocalDate();
        List<Object[]> showtimeRows = em.createQuery(
                        "SELECT s.cinemaRoom.cinemaRoomID, COUNT(s) FROM Showtime s WHERE s.date BETWEEN :start AND :end GROUP BY s.cinemaRoom.cinemaRoomID", Object[].class)
                .setParameter("start", startDate)
                .setParameter("end", endDate)
                .getResultList();

        Map<Integer, Long> showtimeCountByRoom = new HashMap<>();
        for (Object[] r : showtimeRows) {
            Integer roomId = asInt(r[0]);
            Long cnt = asLong(r[1]);
            showtimeCountByRoom.put(roomId, cnt);
        }

        // 3) total opportunities per area
        Map<String, Long> totalOpportunitiesByArea = new HashMap<>();
        for (Map.Entry<Integer, Map<String, Long>> entry : seatCountPerRoom.entrySet()) {
            Integer roomId = entry.getKey();
            Long showCnt = showtimeCountByRoom.getOrDefault(roomId, 0L);
            if (showCnt == 0) continue;
            Map<String, Long> perArea = entry.getValue();
            for (Map.Entry<String, Long> a : perArea.entrySet()) {
                String area = a.getKey();
                Long seatsInRoomArea = a.getValue();
                totalOpportunitiesByArea.put(area, totalOpportunitiesByArea.getOrDefault(area, 0L) + seatsInRoomArea * showCnt);
            }
        }

        List<AreaOccupancyItemDTO> areaStats = new ArrayList<>();
        for (Map.Entry<String, Long> entry : totalSeatsByArea.entrySet()) {
            String area = entry.getKey();
            Long totalSeats = entry.getValue();
            Long soldSeats = soldSeatsByArea.getOrDefault(area, 0L);
            Long opportunities = totalOpportunitiesByArea.getOrDefault(area, 0L);
            double occupancy = opportunities == 0 ? 0.0 : (soldSeats * 100.0) / opportunities;
            areaStats.add(AreaOccupancyItemDTO.builder()
                    .area(area)
                    .bookedCount(soldSeats)
                    .totalSeats(opportunities) // show number of seat-opportunities
                    .occupancyRate(occupancy)
                    .build());
        }
        areaStats.sort(Comparator.comparing(AreaOccupancyItemDTO::getOccupancyRate).reversed());

        return SeatAnalyticsDTO.builder()
                .mostBookedSeat(topSeat)
                .topSeats(aggregated.stream().limit(10).toList())
                .areaOccupancy(areaStats)
                .build();
    }

    private List<DailyFillRateItemDTO> buildDailyFillRate(LocalDate startDate, LocalDate endDate) {
        // total seats per date from showtimes
        List<Object[]> totalSeatsRows = em.createQuery(
                        "SELECT s.date, COALESCE(SUM(s.cinemaRoom.seatQuantity),0) FROM Showtime s WHERE s.date BETWEEN :start AND :end GROUP BY s.date", Object[].class)
                .setParameter("start", startDate)
                .setParameter("end", endDate)
                .getResultList();

        Map<java.time.LocalDate, Long> totalSeatsByDate = new HashMap<>();
        for (Object[] r : totalSeatsRows) {
            java.time.LocalDate date = (java.time.LocalDate) r[0];
            Long total = asLong(r[1]);
            totalSeatsByDate.put(date, total);
        }

        // sold seats per date from ticket details -> booking.dateShow
        List<Object[]> soldRows = em.createQuery(
                        "SELECT tb.dateShow, COUNT(td.ticketDetailID) FROM TicketDetail td JOIN td.booking tb WHERE LOWER(tb.status) = 'success' AND tb.dateShow BETWEEN :start AND :end GROUP BY tb.dateShow", Object[].class)
                .setParameter("start", startDate)
                .setParameter("end", endDate)
                .getResultList();

        Map<java.time.LocalDate, Long> soldByDate = new HashMap<>();
        for (Object[] r : soldRows) {
            java.time.LocalDate date = (java.time.LocalDate) r[0];
            Long sold = asLong(r[1]);
            soldByDate.put(date, sold);
        }

        List<DailyFillRateItemDTO> out = new ArrayList<>();
        java.time.LocalDate cur = startDate;
        while (!cur.isAfter(endDate)) {
            Long total = totalSeatsByDate.getOrDefault(cur, 0L);
            Long sold = soldByDate.getOrDefault(cur, 0L);
            double rate = total == 0 ? 0.0 : (sold * 100.0) / total;
            out.add(DailyFillRateItemDTO.builder().date(cur.toString()).fillRate(rate).build());
            cur = cur.plusDays(1);
        }
        return out;
    }

    private List<OccupancyShowtimeItemDTO> buildOccupancyByShowtime(LocalDate startDate, LocalDate endDate) {
        List<Object[]> rows = em.createQuery(
                        "SELECT s.showtimeID, s.movie.title, s.cinemaRoom.cinema.name, s.cinemaRoom.roomName, s.date, s.time, s.cinemaRoom.seatQuantity, " +
                                "SUM(CASE WHEN LOWER(tb.status) = 'success' THEN 1 ELSE 0 END) " +
                                "FROM Showtime s LEFT JOIN s.bookings tb LEFT JOIN tb.ticketDetails td " +
                                "WHERE s.date BETWEEN :startDate AND :endDate " +
                                "GROUP BY s.showtimeID, s.movie.title, s.cinemaRoom.cinema.name, s.cinemaRoom.roomName, s.date, s.time, s.cinemaRoom.seatQuantity", Object[].class)
                .setParameter("startDate", startDate)
                .setParameter("endDate", endDate)
                .getResultList();

        List<OccupancyShowtimeItemDTO> out = new ArrayList<>();
        DateTimeFormatter dateFmt = DateTimeFormatter.ISO_DATE;
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");

        for (Object[] row : rows) {
            Long sold = asLong(row[7]);
            Long total = asLong(row[6]);
            double rate = total == 0 ? 0.0 : (sold * 100.0) / total;

            out.add(OccupancyShowtimeItemDTO.builder()
                    .showtimeId(asInt(row[0]))
                    .movieTitle(row[1] == null ? "Unknown" : row[1].toString())
                    .cinemaName(row[2] == null ? "Unknown" : row[2].toString())
                    .roomName(row[3] == null ? "Unknown" : row[3].toString())
                    .showDate(((LocalDate) row[4]).format(dateFmt))
                    .showTime(((LocalTime) row[5]).format(timeFmt))
                    .soldSeats(sold)
                    .totalSeats(total)
                    .occupancyRate(rate)
                    .build());
        }

        out.sort(Comparator.comparing(OccupancyShowtimeItemDTO::getOccupancyRate).reversed());
        return out;
    }

    private List<OccupancyCinemaItemDTO> buildOccupancyByCinema(List<OccupancyShowtimeItemDTO> showtimeItems) {
        Map<String, OccupancyCinemaItemDTO> grouped = new HashMap<>();
        for (OccupancyShowtimeItemDTO item : showtimeItems) {
            String key = item.getCinemaName();
            OccupancyCinemaItemDTO current = grouped.getOrDefault(key, OccupancyCinemaItemDTO.builder()
                    .cinemaId(0)
                    .cinemaName(item.getCinemaName())
                    .soldSeats(0L)
                    .totalSeats(0L)
                    .occupancyRate(0.0)
                    .build());
            current.setSoldSeats(current.getSoldSeats() + item.getSoldSeats());
            current.setTotalSeats(current.getTotalSeats() + item.getTotalSeats());
            grouped.put(key, current);
        }

        List<OccupancyCinemaItemDTO> out = new ArrayList<>(grouped.values());
        for (OccupancyCinemaItemDTO item : out) {
            double rate = item.getTotalSeats() == 0 ? 0.0 : (item.getSoldSeats() * 100.0) / item.getTotalSeats();
            item.setOccupancyRate(rate);
        }
        out.sort(Comparator.comparing(OccupancyCinemaItemDTO::getOccupancyRate).reversed());
        return out;
    }

    private List<AgeGroupAnalyticsItemDTO> buildAgeGroupAnalysis(LocalDateTime start, LocalDateTime end) {
        List<Object[]> rows = em.createQuery(
                        "SELECT c.customerID, c.dob, COUNT(td.ticketDetailID), COALESCE(SUM(td.unitPrice),0) " +
                                "FROM TicketDetail td JOIN td.booking tb JOIN tb.customer c " +
                                "WHERE LOWER(tb.status) = 'success' AND tb.bookingDate BETWEEN :start AND :end " +
                                "GROUP BY c.customerID, c.dob", Object[].class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();

        Map<String, AgeGroupAnalyticsItemDTO> grouped = new HashMap<>();
        grouped.put("<18", AgeGroupAnalyticsItemDTO.builder().ageGroup("<18").customers(0L).ticketsSold(0L).revenue(0.0).build());
        grouped.put("18-25", AgeGroupAnalyticsItemDTO.builder().ageGroup("18-25").customers(0L).ticketsSold(0L).revenue(0.0).build());
        grouped.put("25-35", AgeGroupAnalyticsItemDTO.builder().ageGroup("25-35").customers(0L).ticketsSold(0L).revenue(0.0).build());
        grouped.put(">35", AgeGroupAnalyticsItemDTO.builder().ageGroup(">35").customers(0L).ticketsSold(0L).revenue(0.0).build());

        for (Object[] row : rows) {
            LocalDate dob = (LocalDate) row[1];
            Long tickets = asLong(row[2]);
            Double revenue = asDouble(row[3]);
            String bucket = toAgeBucket(dob);

            AgeGroupAnalyticsItemDTO current = grouped.get(bucket);
            current.setCustomers(current.getCustomers() + 1);
            current.setTicketsSold(current.getTicketsSold() + tickets);
            current.setRevenue(current.getRevenue() + revenue);
        }

        return new ArrayList<>(grouped.values());
    }

    private List<RevenueBreakdownItemDTO> buildRevenueByGenre(List<GenreAnalyticsItemDTO> genreItems) {
        List<RevenueBreakdownItemDTO> out = new ArrayList<>();
        for (GenreAnalyticsItemDTO item : genreItems) {
            out.add(RevenueBreakdownItemDTO.builder()
                    .label(item.getGenre())
                    .ticketCount(item.getTicketsSold())
                    .revenue(item.getRevenue())
                    .build());
        }
        return out;
    }

    private List<RevenueBreakdownItemDTO> buildRevenueByTicketVolume(LocalDateTime start, LocalDateTime end) {
        List<Object[]> rows = em.createQuery(
                        "SELECT tb.bookingID, COUNT(td.ticketDetailID), COALESCE(tb.totalPrice,0) " +
                                "FROM TicketBooking tb LEFT JOIN tb.ticketDetails td " +
                                "WHERE LOWER(tb.status) = 'success' AND tb.bookingDate BETWEEN :start AND :end " +
                                "GROUP BY tb.bookingID, tb.totalPrice", Object[].class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();

        Map<String, RevenueBreakdownItemDTO> grouped = new HashMap<>();
        for (Object[] row : rows) {
            Long ticketCount = asLong(row[1]);
            Double revenue = asDouble(row[2]);
            String bucket = toTicketBucket(ticketCount);
            RevenueBreakdownItemDTO current = grouped.getOrDefault(bucket, RevenueBreakdownItemDTO.builder()
                    .label(bucket)
                    .ticketCount(0L)
                    .revenue(0.0)
                    .build());
            current.setTicketCount(current.getTicketCount() + ticketCount);
            current.setRevenue(current.getRevenue() + revenue);
            grouped.put(bucket, current);
        }

        return grouped.values().stream().sorted(Comparator.comparing(RevenueBreakdownItemDTO::getLabel)).toList();
    }

    private List<RevenueBreakdownItemDTO> buildRevenueByCustomer(LocalDateTime start, LocalDateTime end) {
        List<Object[]> revenueRows = em.createQuery(
                        "SELECT tb.customer.customerID, tb.customer.fullName, COALESCE(SUM(tb.totalPrice),0) " +
                                "FROM TicketBooking tb " +
                                "WHERE LOWER(tb.status) = 'success' AND tb.bookingDate BETWEEN :start AND :end " +
                                "GROUP BY tb.customer.customerID, tb.customer.fullName", Object[].class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();

        Map<Integer, Long> ticketCountByCustomer = new HashMap<>();
        List<Object[]> ticketRows = em.createQuery(
                        "SELECT tb.customer.customerID, COUNT(td.ticketDetailID) " +
                                "FROM TicketDetail td JOIN td.booking tb " +
                                "WHERE LOWER(tb.status) = 'success' AND tb.bookingDate BETWEEN :start AND :end " +
                                "GROUP BY tb.customer.customerID", Object[].class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();

        for (Object[] row : ticketRows) {
            ticketCountByCustomer.put(asInt(row[0]), asLong(row[1]));
        }

        List<RevenueBreakdownItemDTO> out = new ArrayList<>();
        for (Object[] row : revenueRows) {
            Integer customerId = asInt(row[0]);
            String fullName = row[1] == null ? "Unknown" : row[1].toString();
            out.add(RevenueBreakdownItemDTO.builder()
                    .label(fullName)
                    .ticketCount(ticketCountByCustomer.getOrDefault(customerId, 0L))
                    .revenue(asDouble(row[2]))
                    .build());
        }

        return out.stream()
                .sorted(Comparator.comparing(RevenueBreakdownItemDTO::getRevenue).reversed())
                .limit(10)
                .toList();
    }

    private String toGroupLabel(LocalDate date, String groupBy) {
        if ("week".equalsIgnoreCase(groupBy)) {
            WeekFields weekFields = WeekFields.of(Locale.getDefault());
            int week = date.get(weekFields.weekOfWeekBasedYear());
            int year = date.get(weekFields.weekBasedYear());
            return String.format("%d-W%02d", year, week);
        }
        if ("month".equalsIgnoreCase(groupBy)) {
            return date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }
        return date.format(DateTimeFormatter.ISO_DATE);
    }

    private String classifyTimeSlot(LocalTime time) {
        if (time == null) return "TOI";
        int hour = time.getHour();
        if (hour >= 5 && hour < 12) return "SANG";
        if (hour >= 12 && hour < 18) return "CHIEU";
        return "TOI";
    }

    private String classifySeatArea(String seatType, Integer col) {
        if (seatType != null && seatType.equalsIgnoreCase("VIP")) {
            return "VIP";
        }
        if (col == null) {
            return "HANG_GIUA";
        }
        if (col <= 2 || col >= 10) {
            return "GOC";
        }
        return "HANG_GIUA";
    }

    private String toAgeBucket(LocalDate dob) {
        if (dob == null) return ">35";
        int age = Period.between(dob, LocalDate.now()).getYears();
        if (age < 18) return "<18";
        if (age <= 25) return "18-25";
        if (age <= 35) return "25-35";
        return ">35";
    }

    private String toTicketBucket(Long ticketCount) {
        long count = ticketCount == null ? 0 : ticketCount;
        if (count <= 1) return "1 VE";
        if (count == 2) return "2 VE";
        if (count == 3) return "3 VE";
        if (count == 4) return "4 VE";
        return "5+ VE";
    }

    private Double asDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Number) return ((Number) value).doubleValue();
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException ex) {
            return 0.0;
        }
    }

    private Long asLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof Number) return ((Number) value).longValue();
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException ex) {
            return 0L;
        }
    }

    private Integer asInt(Object value) {
        if (value == null) return 0;
        if (value instanceof Number) return ((Number) value).intValue();
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException ex) {
            return 0;
        }
    }
}


