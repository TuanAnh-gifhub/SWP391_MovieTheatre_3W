package movie.swp391.service;

import movie.swp391.request.member.UpdateProfileRequest;
import movie.swp391.response.AccountResponse;
import movie.swp391.response.CalculateScoreAndRankResponse;
import movie.swp391.response.CustomerResponse;
import movie.swp391.response.ViewScoreHistoryResponse;
import movie.swp391.response.common.BaseResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

public interface MemberService {

    ResponseEntity<BaseResponse<Void>> editProfile(String username, UpdateProfileRequest request);
    List<ViewScoreHistoryResponse> viewScoreHistory(Integer customerId);
     CustomerResponse viewCustomerProfile(Integer customerId);
    List<AccountResponse> getAllAccounts();
    BaseResponse<String> setAccountActiveStatus(Integer accountId, Boolean active);
    @PreAuthorize("hasRole('CUSTOMER')")
    CalculateScoreAndRankResponse recalculateCustomerScores(Integer customerId);
}
