package movie.swp391.controller;

import lombok.RequiredArgsConstructor;
import movie.swp391.service.CustomerReportService;
import movie.swp391.serviceImp.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import movie.swp391.request.CustomerPurchaseReportDto;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;
    private final CustomerReportService customerReportService;

    @GetMapping("/revenue-pdf")
    public ResponseEntity<byte[]> getRevenuePdf() throws Exception {
        byte[] pdfBytes = reportService.createRevenueReportPdf();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename("revenue_report.pdf").build());
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
    @GetMapping("/reports/customers/export/pdf")
    public ResponseEntity<byte[]> exportCustomerReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(defaultValue = "totalOrders") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) throws IOException {
        ByteArrayInputStream in = customerReportService.exportCustomerReportToPdf(start, end, sortBy, direction);
        byte[] pdf = in.readAllBytes();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename("customer-report.pdf").build());

        return ResponseEntity.ok().headers(headers).body(pdf);
    }
    @GetMapping("/reports/customers")
    public ResponseEntity<List<CustomerPurchaseReportDto>> getCustomerReportData(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(defaultValue = "totalSpent") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        List<CustomerPurchaseReportDto> result = customerReportService.getCustomerReportData(start, end, sortBy, direction);
        return ResponseEntity.ok(result);
    }
}
