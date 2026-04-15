package movie.swp391.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerPurchaseReportDto {
    private Integer customerId;
    private String fullName;
    private Long totalOrders;
    private Double averageOrderValue;
    private double totalSpent;
    private LocalDateTime lastOrderDate;
}
