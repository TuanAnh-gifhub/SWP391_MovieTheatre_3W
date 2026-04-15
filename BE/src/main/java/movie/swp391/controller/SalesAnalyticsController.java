package movie.swp391.controller;

import movie.swp391.response.SalesSummaryResponse;
import movie.swp391.service.SalesAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SalesAnalyticsController {
    @Autowired
    private SalesAnalyticsService salesAnalyticsService;

    @GetMapping("/summary")
    public ResponseEntity<List<SalesSummaryResponse>> getSalesSummary(
            @RequestParam String from,
            @RequestParam String to
    ) {
        List<SalesSummaryResponse> summary = salesAnalyticsService.getSalesSummary(from, to);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/summary/csv")
    public void exportSalesSummaryCsv(
            @RequestParam String from,
            @RequestParam String to,
            HttpServletResponse response
    ) {
        salesAnalyticsService.exportSalesSummaryCsv(from, to, response);
    }

    @GetMapping("/summary/pdf")
    public void exportSalesSummaryPdf(
            @RequestParam String from,
            @RequestParam String to,
            jakarta.servlet.http.HttpServletResponse response
    ) {
        salesAnalyticsService.exportSalesSummaryPdf(from, to, response);
    }
}