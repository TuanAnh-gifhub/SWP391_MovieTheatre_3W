package movie.swp391.dto;

import java.math.BigDecimal;

public class SalesSummaryDTO {
    private String category;
    private Long orderVolume;
    private Double revenue;

    public SalesSummaryDTO() {}

    public SalesSummaryDTO(String category, Long orderVolume, Double revenue) {
        this.category = category;
        this.orderVolume = orderVolume;
        this.revenue = revenue;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Long getOrderVolume() {
        return orderVolume;
    }

    public void setOrderVolume(Long orderVolume) {
        this.orderVolume = orderVolume;
    }

    public Double getRevenue() {
        return revenue;
    }

    public void setRevenue(Double revenue) {
        this.revenue = revenue;
    }
}

