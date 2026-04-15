package movie.swp391.serviceImp;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import lombok.RequiredArgsConstructor;
import movie.swp391.response.MovieDayRevenueResponse;
import movie.swp391.response.ExportMovieDateSummaryResponse;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.data.category.DefaultCategoryDataset;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

import javax.imageio.ImageIO;
import org.jfree.data.general.DefaultPieDataset;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ExportServiceImpl exportService; // Service của bạn lấy dữ liệu

    public byte[] createRevenueReportPdf() throws Exception {
        List<MovieDayRevenueResponse> report = exportService.getSummaryByExportDate();
        ByteArrayOutputStream pdfBaos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(pdfBaos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        document.add(new Paragraph("BÁO CÁO DOANH THU PHIM THEO NGÀY").setFontSize(16).setBold());

        // 2. Tạo dataset vẽ chart (tổng doanh thu từng ngày)
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (MovieDayRevenueResponse day : report) {
            if (day.getMovies() != null) {
                double totalDay = day.getMovies().stream()
                        .filter(Objects::nonNull)
                        .mapToDouble(ExportMovieDateSummaryResponse::getTotalMoney)
                        .sum();

                double totalSeatMoney = day.getMovies().stream()
                        .filter(Objects::nonNull)
                        .mapToDouble(ExportMovieDateSummaryResponse::getTotalMoneyWithoutFoodAndDiscount)
                        .sum();

                double totalFoodMoney = day.getMovies().stream()
                        .filter(Objects::nonNull)
                        .mapToDouble(ExportMovieDateSummaryResponse::getTotalMoneyFood)
                        .sum();

                double totalDiscountMoney = day.getMovies().stream()
                        .filter(Objects::nonNull)
                        .mapToDouble(ExportMovieDateSummaryResponse::getTotalMoneyDiscount)
                        .sum();

                double totalScoresMoney = day.getMovies().stream()
                        .filter(Objects::nonNull)
                        .mapToDouble(ExportMovieDateSummaryResponse::getBuyByScore)
                        .sum();

                dataset.addValue(totalDay, "Total money", day.getExportDate().format(f));
                dataset.addValue(totalSeatMoney, "Total Seat Money", day.getExportDate().format(f));
                dataset.addValue(totalFoodMoney, "Total Food Money", day.getExportDate().format(f));
                dataset.addValue(totalDiscountMoney, "Total Discount Money", day.getExportDate().format(f));
                dataset.addValue(totalScoresMoney, "Total Scores Money", day.getExportDate().format(f));
            }
        }

        // 3. Vẽ đồ thị cột
        JFreeChart barChart = ChartFactory.createBarChart(
                "Doanh thu theo ngày", "Ngày", "VNĐ", dataset);

        // Tùy chỉnh font tiếng Việt nếu dùng (nếu lỗi font)
        barChart.getCategoryPlot().getRenderer().setSeriesPaint(0, new Color(24,144,255));

        int width = 550, height = 340;
        BufferedImage chartImage = barChart.createBufferedImage(width, height);
        ByteArrayOutputStream chartBaos = new ByteArrayOutputStream();
        ImageIO.write(chartImage, "png", chartBaos);

        // 4. Chèn ảnh đồ thị vào pdf
        Image chart = new Image(ImageDataFactory.create(chartBaos.toByteArray()));
        document.add(chart);

        // Tạo bảng với cột mở rộng

        Table table = new Table(new float[]{
                3, 5, 5, 5, 5, 5, 5, 5
        }).useAllAvailableWidth();
        table.addHeaderCell("Date");
        table.addHeaderCell("Movie");
        table.addHeaderCell("Total Money");
        table.addHeaderCell("Total Seat Money");
        table.addHeaderCell("Total Food Money");
        table.addHeaderCell("Total Discount Money");
        table.addHeaderCell("Total Scores Money");
        table.addHeaderCell("Tickets");

        for (MovieDayRevenueResponse day : report) {
            String dateStr = day.getExportDate().format(f);
            for (ExportMovieDateSummaryResponse m : day.getMovies()) {
                table.addCell(dateStr);
                table.addCell(m.getMovieTitle());
                table.addCell(String.format("%,.0f", m.getTotalMoney()));
                table.addCell(String.format("%,.0f", m.getTotalMoneyWithoutFoodAndDiscount()));
                table.addCell(String.format("%,.0f", m.getTotalMoneyFood()));
                table.addCell(String.format("%,.0f", m.getTotalMoneyDiscount()));
                table.addCell(m.getBuyByScore() != null ? String.format("%,.0f", m.getBuyByScore()) : "0");
                table.addCell(String.valueOf(m.getSeller()));
            }
        }
        document.add(table);
        for (MovieDayRevenueResponse day : report) {
            BufferedImage pieImage = createPieChartForDay(day);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(pieImage, "png", baos);
            Image pieChartImage = new Image(ImageDataFactory.create(baos.toByteArray()));
            document.add(new Paragraph("Daily turnover ratio chart " + day.getExportDate().toString()));
            document.add(pieChartImage);
        }
        document.close();
        return pdfBaos.toByteArray();
    }

    private BufferedImage createPieChartForDay(MovieDayRevenueResponse day) {
        DefaultPieDataset pieDataset = new DefaultPieDataset();
        double totalRevenue = day.getMovies().stream()
                                    .mapToDouble(ExportMovieDateSummaryResponse::getTotalMoney)
                                    .sum();
        for (ExportMovieDateSummaryResponse m : day.getMovies()) {
            double percentage = (m.getTotalMoney() / totalRevenue) * 100;
            pieDataset.setValue(m.getMovieTitle(), percentage);
        }
        JFreeChart pieChart = ChartFactory.createPieChart(
                "Daily revenue chart in day " + day.getExportDate().toString(),
                pieDataset,
                true, true, false);
        // Tùy chỉnh chart nếu cần
        int width = 400, height = 400;
        return pieChart.createBufferedImage(width, height);
    }
}