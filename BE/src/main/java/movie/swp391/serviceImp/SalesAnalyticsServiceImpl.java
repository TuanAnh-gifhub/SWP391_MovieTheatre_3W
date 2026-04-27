package movie.swp391.serviceImp;

import movie.swp391.entity.*;
import movie.swp391.repository.*;
import movie.swp391.entity.BookingFoodAndDrink;
import movie.swp391.entity.FoodAndDrink;
import movie.swp391.entity.TicketBooking;
import movie.swp391.repository.BookingFoodAndDrinkRepository;
import movie.swp391.repository.FoodAndDrinkRepository;
import movie.swp391.repository.TicketBookingRepository;
import movie.swp391.response.SalesSummaryResponse;
import movie.swp391.service.SalesAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.data.category.DefaultCategoryDataset;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Image;
import com.itextpdf.io.image.ImageDataFactory;
import java.io.ByteArrayOutputStream;
import java.awt.Color;
import java.awt.Font;
import org.jfree.chart.plot.CategoryPlot;
import org.jfree.chart.axis.CategoryAxis;
import org.jfree.chart.axis.CategoryLabelPositions;
import com.itextpdf.layout.element.Table;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;

@Service
public class SalesAnalyticsServiceImpl implements SalesAnalyticsService {
    @Autowired
    private TicketBookingRepository ticketBookingRepository;
    @Autowired
    private BookingFoodAndDrinkRepository bookingFoodAndDrinkRepository;
    @Autowired
    private FoodAndDrinkRepository foodAndDrinkRepository;

    @Override
    public List<SalesSummaryResponse> getSalesSummary(String from, String to) {
        LocalDateTime fromDate = LocalDate.parse(from).atStartOfDay();
        LocalDateTime toDate = LocalDate.parse(to).atTime(LocalTime.MAX);
        List<TicketBooking> bookings = ticketBookingRepository.findByBookingDateBetweenAndStatus(fromDate, toDate, "success");
        List<BookingFoodAndDrink> foodOrders = bookingFoodAndDrinkRepository.findByBooking_BookingDateBetweenAndBooking_Status(fromDate, toDate, "success");

        Map<String, SalesSummaryResponse> summaryMap = new HashMap<>();
        String timeUnit = "day";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Movie ticket sales
        for (TicketBooking booking : bookings) {
            String timeSlot = formatTimeSlot(booking.getBookingDate(), timeUnit, formatter);
            String cat = booking.getShowtime() != null && booking.getShowtime().getMovie() != null ? booking.getShowtime().getMovie().getGenre() : "Unknown";
            String key = timeSlot + "|" + cat;
            SalesSummaryResponse dto = summaryMap.getOrDefault(key, new SalesSummaryResponse(timeSlot, cat, 0, 0.0));
            dto.setOrderVolume(dto.getOrderVolume() + 1);
            dto.setRevenue(dto.getRevenue() + (booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0));
            summaryMap.put(key, dto);
        }

        // Food and drink sales
        for (BookingFoodAndDrink foodOrder : foodOrders) {
            TicketBooking booking = foodOrder.getBooking();
            if (booking == null) continue;
            String timeSlot = formatTimeSlot(booking.getBookingDate(), timeUnit, formatter);
            FoodAndDrink food = foodOrder.getFoodAndDrink();
            String cat = food != null ? food.getType() : "Unknown";
            String key = timeSlot + "|" + cat;
            SalesSummaryResponse dto = summaryMap.getOrDefault(key, new SalesSummaryResponse(timeSlot, cat, 0, 0.0));
            dto.setOrderVolume(dto.getOrderVolume() + foodOrder.getQuantity());
            dto.setRevenue(dto.getRevenue() + (food != null && food.getPrice() != null ? food.getPrice() * foodOrder.getQuantity() : 0.0));
            summaryMap.put(key, dto);
        }

        return new ArrayList<>(summaryMap.values());
    }

    @Override
    public void exportSalesSummaryCsv(String from, String to, HttpServletResponse response) {
        List<SalesSummaryResponse> summary = getSalesSummary(from, to);
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=SalesSummary.csv");
        try (PrintWriter writer = response.getWriter()) {
            writer.println("Time Slot,Category,Order Volume,Revenue");
            for (SalesSummaryResponse dto : summary) {
                writer.printf("%s,%s,%d,%.2f\n", dto.getTimeSlot(), dto.getCategory(), dto.getOrderVolume(), dto.getRevenue());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to export CSV", e);
        }
    }

    @Override
    public void exportSalesSummaryPdf(String from, String to, jakarta.servlet.http.HttpServletResponse response) {
        List<SalesSummaryResponse> summary = getSalesSummary(from, to);
        try {
            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "attachment; filename=SalesSummary.pdf");
            PdfWriter writer = new PdfWriter(response.getOutputStream());
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("BÁO CÁO DOANH THU THEO NGÀY").setFontSize(16).setBold());


            // 1. Dataset cho bar/line chart
            DefaultCategoryDataset dataset = new DefaultCategoryDataset();
            for (SalesSummaryResponse dto : summary) {
                dataset.addValue(dto.getRevenue(), dto.getCategory(), dto.getTimeSlot());
            }

            // 2. Bar chart
            JFreeChart barChart = ChartFactory.createBarChart(
                    "Bar chart",
                    "Ngày",
                    "VNĐ",
                    dataset,
                    PlotOrientation.VERTICAL, true, true, false
            );
            CategoryPlot barPlot = barChart.getCategoryPlot();
            barPlot.setBackgroundPaint(Color.WHITE);
            barPlot.setRangeGridlinePaint(Color.LIGHT_GRAY);
            CategoryAxis barDomainAxis = barPlot.getDomainAxis();
            barDomainAxis.setCategoryLabelPositions(CategoryLabelPositions.createUpRotationLabelPositions(Math.PI / 6)); // Xoay 30 độ
            barDomainAxis.setTickLabelFont(new Font("Arial", Font.PLAIN, 12));
            barDomainAxis.setLabelFont(new Font("Arial", Font.BOLD, 14));

            // 3. Line chart
            JFreeChart lineChart = ChartFactory.createLineChart(
                    "Line chart",
                    "Ngày",
                    "VNĐ",
                    dataset,
                    PlotOrientation.VERTICAL, true, true, false
            );
            CategoryPlot linePlot = lineChart.getCategoryPlot();
            linePlot.setBackgroundPaint(Color.WHITE);
            linePlot.setRangeGridlinePaint(Color.LIGHT_GRAY);
            CategoryAxis lineDomainAxis = linePlot.getDomainAxis();
            lineDomainAxis.setCategoryLabelPositions(CategoryLabelPositions.createUpRotationLabelPositions(Math.PI / 6)); // Xoay 30 độ
            lineDomainAxis.setTickLabelFont(new Font("Arial", Font.PLAIN, 12));
            lineDomainAxis.setLabelFont(new Font("Arial", Font.BOLD, 14));

            int width = 800, height = 400;
            BufferedImage barImg = barChart.createBufferedImage(width, height);
            ByteArrayOutputStream barBaos = new ByteArrayOutputStream();
            ImageIO.write(barImg, "png", barBaos);
            Image barChartImg = new Image(ImageDataFactory.create(barBaos.toByteArray()));
            document.add(barChartImg);

            BufferedImage lineImg = lineChart.createBufferedImage(width, height);
            ByteArrayOutputStream lineBaos = new ByteArrayOutputStream();
            ImageIO.write(lineImg, "png", lineBaos);
            Image lineChartImg = new Image(ImageDataFactory.create(lineBaos.toByteArray()));
            document.add(lineChartImg);

            // 4. Bảng dữ liệu chi tiết
            Table table = new Table(new float[]{4, 4, 4, 4}).useAllAvailableWidth();
            table.addHeaderCell("Time Slot");
            table.addHeaderCell("Category");
            table.addHeaderCell("Order Volume");
            table.addHeaderCell("Revenue (VNĐ)");
            for (SalesSummaryResponse dto : summary) {
                table.addCell(dto.getTimeSlot());
                table.addCell(dto.getCategory());
                table.addCell(String.valueOf(dto.getOrderVolume()));
                table.addCell(String.format("%,.0f", dto.getRevenue()));
            }
            document.add(new Paragraph("Bảng dữ liệu chi tiết:"));
            document.add(table);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export PDF", e);
        }
    }

    private String formatTimeSlot(LocalDateTime dateTime, String timeUnit, DateTimeFormatter formatter) {
        switch (timeUnit) {
            case "hour":
                return dateTime.format(formatter);
            case "day":
                return dateTime.toLocalDate().format(formatter);
            case "week":
                return dateTime.format(formatter);
            default:
                return dateTime.toLocalDate().format(formatter);
        }
    }
}
