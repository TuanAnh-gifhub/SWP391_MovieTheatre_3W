package movie.swp391.service;


import movie.swp391.request.CustomerPurchaseReportDto;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

public interface CustomerReportService {
    List<CustomerPurchaseReportDto> getCustomerReportData(LocalDate start, LocalDate end, String sortBy, String direction);

    ByteArrayInputStream exportCustomerReportToPdf(LocalDate startDate, LocalDate endDate, String sortBy, String direction) throws IOException;
}

