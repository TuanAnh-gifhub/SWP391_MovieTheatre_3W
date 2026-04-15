package movie.swp391.serviceImp;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.property.UnitValue;
import lombok.RequiredArgsConstructor;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.request.CustomerPurchaseReportDto;
import movie.swp391.repository.CustomerRepository;
import movie.swp391.service.CustomerReportService;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.axis.CategoryLabelPositions;
import org.jfree.chart.plot.CategoryPlot;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.renderer.category.BarRenderer;
import org.jfree.data.category.DefaultCategoryDataset;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.sql.Timestamp;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomerReportServiceImpl implements CustomerReportService {

    private final CustomerRepository customerRepository;

    @Override
    public List<CustomerPurchaseReportDto> getCustomerReportData(LocalDate startDate, LocalDate endDate, String sortBy, String direction) {
        // Kiểm tra giá trị sortBy hợp lệ (chỉ chấp nhận totalOrders hoặc totalSpent)
        if (sortBy == null || sortBy.isBlank()) {
            sortBy = "totalSpent";
        }
        if (direction == null || direction.isBlank()) {
            direction = "desc";
        }
        Set<String> allowedSortFields = Set.of("totalOrders", "totalSpent");
        if (!allowedSortFields.contains(sortBy)) {
            throw new AppException(ErrorHandler.SORT_BY_INVALID);
        }

        // Kiểm tra direction hợp lệ (chỉ asc hoặc desc)
        if (!direction.equalsIgnoreCase("asc") && !direction.equalsIgnoreCase("desc")) {
            throw new AppException(ErrorHandler.DIRECTION_INVALID);
        }

        // Lấy dữ liệu từ repository
        List<Object[]> rawData = customerRepository.getCustomerPurchaseReportNative(startDate, endDate);
        List<CustomerPurchaseReportDto> reports = rawData.stream().map(obj -> new CustomerPurchaseReportDto(
                (Integer) obj[0],
                (String) obj[1],
                ((Number) obj[2]).longValue(),
                ((Number) obj[3]).doubleValue(),
                ((Number) obj[4]).doubleValue(),
                obj[5] != null ? ((Timestamp) obj[5]).toLocalDateTime() : null
        )).toList();

        // So sánh theo sortBy
        Comparator<CustomerPurchaseReportDto> comparator;
        if ("totalOrders".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparingLong(CustomerPurchaseReportDto::getTotalOrders);
        } else {
            comparator = Comparator.comparingDouble(CustomerPurchaseReportDto::getTotalSpent);
        }

        // Nếu là desc thì đảo ngược
        if ("desc".equalsIgnoreCase(direction)) {
            comparator = comparator.reversed();
        }

        return reports.stream()
                .sorted(comparator)
                .toList();
    }

    @Override
    public ByteArrayInputStream exportCustomerReportToPdf(LocalDate startDate, LocalDate endDate, String sortBy, String direction) throws IOException {
        if (sortBy == null || sortBy.isBlank()) {
            sortBy = "totalSpent";
        }
        if (direction == null || direction.isBlank()) {
            direction = "desc";
        }
        if (!"totalOrders".equalsIgnoreCase(sortBy) && !"totalSpent".equalsIgnoreCase(sortBy)) {
            throw new AppException(ErrorHandler.SORT_BY_INVALID);
        }

        // Validate direction
        if (!"asc".equalsIgnoreCase(direction) && !"desc".equalsIgnoreCase(direction)) {
            throw new AppException(ErrorHandler.DIRECTION_INVALID);
        }
        List<Object[]> rawData = customerRepository.getCustomerPurchaseReportNative(startDate, endDate);
        List<CustomerPurchaseReportDto> reports = rawData.stream().map(obj -> new CustomerPurchaseReportDto(
                (Integer) obj[0],
                (String) obj[1],
                ((Number) obj[2]).longValue(),
                ((Number) obj[3]).doubleValue(),
                ((Number) obj[4]).doubleValue(),
                obj[5] != null ? ((Timestamp) obj[5]).toLocalDateTime() : null
        )).toList();

        // === Dynamic Sort Logic ===
        Comparator<CustomerPurchaseReportDto> comparator;
        if ("totalOrders".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparingLong(CustomerPurchaseReportDto::getTotalOrders);
        } else {
            comparator = Comparator.comparingDouble(CustomerPurchaseReportDto::getTotalSpent);
        }

        if ("desc".equalsIgnoreCase(direction)) {
            comparator = comparator.reversed();
        }

        List<CustomerPurchaseReportDto> sortedReports = reports.stream()
                .sorted(comparator)
                .toList();

        // Top 10 for charts
        List<CustomerPurchaseReportDto> top10ByMetric = sortedReports.stream().limit(10).toList();

        // Chart dataset
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        for (CustomerPurchaseReportDto r : top10ByMetric) {
            if ("totalOrders".equalsIgnoreCase(sortBy)) {
                dataset.addValue(r.getTotalOrders(), "Total Orders", r.getFullName());
            } else {
                dataset.addValue(r.getTotalSpent(), "Total Spent", r.getFullName());
            }
        }

        String chartTitle = "Top 10 Customers by " + ("totalOrders".equalsIgnoreCase(sortBy) ? "Total Orders" : "Total Spent");
        String valueLabel = "totalOrders".equalsIgnoreCase(sortBy) ? "Total Orders" : "Total Spent (VND)";

        // Chart
        JFreeChart chart = ChartFactory.createBarChart(
                chartTitle,
                "Customer",
                valueLabel,
                dataset,
                PlotOrientation.VERTICAL,
                true,
                true,
                false
        );

        CategoryPlot plot = chart.getCategoryPlot();
        plot.getDomainAxis().setCategoryLabelPositions(CategoryLabelPositions.UP_45);
        plot.setRenderer(new BarRenderer());

        BufferedImage chartImage = chart.createBufferedImage(800, 400);
        ByteArrayOutputStream chartOut = new ByteArrayOutputStream();
        ImageIO.write(chartImage, "png", chartOut);
        byte[] chartBytes = chartOut.toByteArray();

        // === PDF generation ===
        ByteArrayOutputStream pdfOut = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(pdfOut);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        DecimalFormat df = new DecimalFormat("#,###.00");

        document.add(new Paragraph(chartTitle));
        document.add(new Image(ImageDataFactory.create(chartBytes)).setAutoScale(true));

        document.add(new Paragraph("\nCustomer Purchase Report (Sorted by " + sortBy + " - " + direction.toUpperCase() + ")"));
        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 4, 2, 2, 2, 3}));
        table.setWidth(UnitValue.createPercentValue(100));
        table.addHeaderCell("ID");
        table.addHeaderCell("Name");
        table.addHeaderCell("Orders");
        table.addHeaderCell("Avg Value");
        table.addHeaderCell("Total Spent");
        table.addHeaderCell("Last Order");

        for (CustomerPurchaseReportDto r : sortedReports) {
            table.addCell(String.valueOf(r.getCustomerId()));
            table.addCell(r.getFullName());
            table.addCell(String.valueOf(r.getTotalOrders()));
            table.addCell(df.format(r.getAverageOrderValue()));
            table.addCell(df.format(r.getTotalSpent()));
            table.addCell(r.getLastOrderDate() != null ? r.getLastOrderDate().toString() : "-");
        }
        document.add(table);

        document.close();
        return new ByteArrayInputStream(pdfOut.toByteArray());
    }

}
