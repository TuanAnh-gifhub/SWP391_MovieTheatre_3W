package movie.swp391.repository;

import movie.swp391.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.account a LEFT JOIN FETCH a.role WHERE LOWER(e.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(e.identityCard) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(e.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(e.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Employee> findByKeyword(@Param("keyword") String keyword);

    Optional<Employee> findByEmail(String email);


    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.account a LEFT JOIN FETCH a.role")
    List<Employee> findAllWithAccountAndRole();


    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.account a LEFT JOIN FETCH a.role WHERE a.role.roleName = 'EMPLOYEE'")
    List<Employee> findAllEmployeesOnly();


    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.account a LEFT JOIN FETCH a.role WHERE a.role.roleName = 'EMPLOYEE' AND (LOWER(e.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(e.identityCard) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(e.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(e.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Employee> findEmployeesOnlyByKeyword(@Param("keyword") String keyword);


    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.account a LEFT JOIN FETCH a.role WHERE e.employeeID = :employeeId")
    Optional<Employee> findByIdWithAccountAndRole(@Param("employeeId") Integer employeeId);

    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.account a LEFT JOIN FETCH a.role WHERE e.employeeID = :employeeId AND a.role.roleName = 'EMPLOYEE'")
    Optional<Employee> findEmployeeOnlyById(@Param("employeeId") Integer employeeId);
}