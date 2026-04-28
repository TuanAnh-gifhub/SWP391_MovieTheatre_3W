package movie.swp391.service;

import movie.swp391.entity.Account;
import movie.swp391.request.ForgotPasswordRequest;
import movie.swp391.request.ResetPasswordRequest;
import movie.swp391.response.common.BaseResponse;
import org.springframework.transaction.annotation.Transactional;
import movie.swp391.response.AssignRoleResponse;

public interface AccountService {
    BaseResponse<String> forgotPassword(ForgotPasswordRequest request);
    BaseResponse<String> resetPassword(ResetPasswordRequest request);
    BaseResponse<String> verifyEmail(String token);
    void createEmailVerificationToken(Account account);
    String createEmailVerificationTokenForTemporaryAccount(String email);
    BaseResponse<Void> sendResetPasswordOtp(String emailOrUsername);
    @Transactional
    BaseResponse<String> assignRoleToAccount(Integer accountId, Integer roleId);

    @Transactional
    BaseResponse<AssignRoleResponse> assignRoleToAccountWithDetails(Integer accountId, Integer roleId);
}