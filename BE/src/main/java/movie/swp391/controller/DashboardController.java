package movie.swp391.controller;

import movie.swp391.dto.*;
import movie.swp391.service.DashboardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (from == null) from = LocalDate.now().minusMonths(1);
        if (to == null) to = LocalDate.now();
        return ResponseEntity.ok(service.getSummary(from, to));
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<RevenuePointDTO>> getRevenue(
            @RequestParam(defaultValue = "month") String range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        if (start == null) start = LocalDate.now().minusMonths(1);
        if (end == null) end = LocalDate.now();
        return ResponseEntity.ok(service.getRevenueByRange(start, end, range));
    }

    @GetMapping("/sales-summary")
    public ResponseEntity<List<SalesSummaryDTO>> getSalesSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        if (start == null) start = LocalDate.now().minusMonths(1);
        if (end == null) end = LocalDate.now();
        return ResponseEntity.ok(service.getSalesSummary(start, end));
    }

    @GetMapping("/customers")
    public ResponseEntity<List<CustomerAnalyticsDTO>> getCustomers(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        if (start == null) start = LocalDate.now().minusMonths(1);
        if (end == null) end = LocalDate.now();
        return ResponseEntity.ok(service.getCustomerAnalytics(start, end));
    }

    @GetMapping("/analytics-overview")
    public ResponseEntity<DashboardAnalyticsResponseDTO> getAnalyticsOverview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(defaultValue = "day") String groupBy,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate focusDate) {
        if (start == null) start = LocalDate.now().minusDays(30);
        if (end == null) end = LocalDate.now();
        if (focusDate == null) focusDate = end;
        return ResponseEntity.ok(service.getAnalyticsOverview(start, end, groupBy, focusDate));
    }

    @GetMapping(value = "/sales-summary/export", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> exportSalesSummary(@RequestParam(defaultValue = "csv") String format,
                                                     @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
                                                     @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        if (start == null) start = LocalDate.now().minusMonths(1);
        if (end == null) end = LocalDate.now();
        byte[] data = service.exportSalesSummary(format, start, end);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDisposition(ContentDisposition.attachment().filename("sales-summary." + (format.equalsIgnoreCase("csv") ? "csv" : "pdf")).build());
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }
}

