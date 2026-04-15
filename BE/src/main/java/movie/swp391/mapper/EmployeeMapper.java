package movie.swp391.mapper;

import movie.swp391.entity.Employee;
import movie.swp391.request.employee.EmployeeRequest;
import movie.swp391.response.EmployeeResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    @Mapping(target = "status", source = "active")
    @Mapping(target = "roleName", expression = "java(employee.getAccount() != null && employee.getAccount().getRole() != null ? employee.getAccount().getRole().getRoleName() : null)")
    EmployeeResponse toEmployeeResponse(Employee employee);

    List<EmployeeResponse> toEmployeeResponses(List<Employee> employees);

    @Mapping(target = "employeeID", ignore = true)
    @Mapping(target = "account", ignore = true)
    @Mapping(target = "phone", source = "phone")
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "updatedDate", ignore = true)
    void updateEmployeeFromRequest(EmployeeRequest request, @MappingTarget Employee employee);

    @Mapping(target = "employeeID", ignore = true)
    @Mapping(target = "account", ignore = true)
    @Mapping(target = "phone", source = "phone")
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "updatedDate", ignore = true)
    Employee toEmployee(EmployeeRequest request);
} 