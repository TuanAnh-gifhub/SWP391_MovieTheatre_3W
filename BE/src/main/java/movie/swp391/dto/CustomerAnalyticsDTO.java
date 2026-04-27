package movie.swp391.dto;

public class CustomerAnalyticsDTO {
    private Integer customerId;
    private String fullName;
    private Long totalOrders;
    private Double totalSpent;

    public CustomerAnalyticsDTO() {}

    public CustomerAnalyticsDTO(Integer customerId, String fullName, Long totalOrders, Double totalSpent) {
        this.customerId = customerId;
        this.fullName = fullName;
        this.totalOrders = totalOrders;
        this.totalSpent = totalSpent;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Double getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(Double totalSpent) {
        this.totalSpent = totalSpent;
    }
}

