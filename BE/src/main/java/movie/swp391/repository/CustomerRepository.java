package movie.swp391.repository;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import movie.swp391.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByIdentityCard(String identityCard);
    Optional<Customer> findByPhone(String phone);
    Optional<Object> findCustomerByEmail(@NotBlank(message = "Email is required") @Email(message = "Invalid email format") @Size(max = 100) String email);
    Optional<Customer> findByAccount_Username(String username);

    @Query(value = """
        SELECT c.customerID, c.full_name,
               COUNT(b.bookingID) AS totalOrders,
               CAST(COALESCE(AVG(b.total_price), 0.0) AS float) AS avgOrderValue,
               CAST(COALESCE(SUM(b.total_price), 0.0) AS float) AS totalSpent,
               MAX(b.booking_date) AS lastOrderDate
        FROM customers c
        LEFT JOIN ticket_bookings b ON c.customerID = b.customerID AND b.status = 'Success'
        WHERE (:startDate IS NULL OR CAST(b.booking_date AS DATE) >= :startDate)
          AND (:endDate IS NULL OR CAST(b.booking_date AS DATE) <= :endDate)
        GROUP BY c.customerID, c.full_name
""", nativeQuery = true)
    List<Object[]> getCustomerPurchaseReportNative(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );


}