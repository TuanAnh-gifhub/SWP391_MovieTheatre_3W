package movie.swp391.service;

import movie.swp391.request.ResetPasswordRequest;
import movie.swp391.request.employee.EmployeeRequest;
import movie.swp391.response.EmployeeResponse;
import movie.swp391.response.common.BaseResponse;

import java.util.List;

public interface EmployeeService {
    BaseResponse<List<EmployeeResponse>> getAllEmployees();
    BaseResponse<List<EmployeeResponse>> searchEmployees(String keyword);
    BaseResponse<EmployeeResponse> addEmployee(EmployeeRequest request);
    BaseResponse<EmployeeResponse> updateEmployee(Integer employeeId, EmployeeRequest request);
    BaseResponse<Void> turnOnOffEmployee(List<Integer> employeeId);

    BaseResponse<EmployeeResponse> getEmployeeById(Integer employeeId);
    BaseResponse<EmployeeResponse> setActiveStatus(Integer id, boolean active);

    void deleteEmployeeByIds(List<Integer> employeeIds);
    BaseResponse<Void> resetEmployeePassword(ResetPasswordRequest request);
    BaseResponse<Void> sendEmployeeResetPasswordOtp(Integer employeeId);
    BaseResponse<Void> resetEmployeePasswordWithOtp(ResetPasswordRequest request);
    BaseResponse<Void> forgotEmployeePassword(String email);
} 