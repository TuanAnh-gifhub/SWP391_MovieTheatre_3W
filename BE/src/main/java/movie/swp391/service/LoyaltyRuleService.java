package movie.swp391.service;

import movie.swp391.request.LoyaltyRuleRequest;
import movie.swp391.response.LoyaltyRuleResponse;

import java.util.List;


public interface LoyaltyRuleService {


    LoyaltyRuleResponse createRule(LoyaltyRuleRequest request);
    String updateRule(Integer id, LoyaltyRuleRequest request);
    List<LoyaltyRuleResponse> viewRuleList();
    void turnOnOffLoyaltyRule(Integer loyaltyRuleId);
    void deleteRule(Integer loyaltyRuleId);



}
