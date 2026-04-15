package movie.swp391.service;

import movie.swp391.response.SalesSummaryResponse;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

public interface SalesAnalyticsService {
    List<SalesSummaryResponse> getSalesSummary(String from, String to);
    void exportSalesSummaryCsv(String from, String to, HttpServletResponse response);
    void exportSalesSummaryPdf(String from, String to, jakarta.servlet.http.HttpServletResponse response);
}