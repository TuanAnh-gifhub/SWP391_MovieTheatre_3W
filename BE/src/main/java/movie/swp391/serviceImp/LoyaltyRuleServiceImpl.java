package movie.swp391.serviceImp;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.entity.LoyaltyRule;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.repository.LoyaltyRuleRepository;
import movie.swp391.request.LoyaltyRuleRequest;
import movie.swp391.response.LoyaltyRuleResponse;
import movie.swp391.service.LoyaltyRuleService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class LoyaltyRuleServiceImpl implements LoyaltyRuleService {
     LoyaltyRuleRepository loyaltyRuleRepository;

     @Override
     @Transactional
     public LoyaltyRuleResponse createRule(LoyaltyRuleRequest request) {
          boolean activeRuleExists = loyaltyRuleRepository.existsByIsActiveTrue();
          if (activeRuleExists) {
               throw new AppException(ErrorHandler.LOYALTY_RULE_IN_ACTIVE, "Đã có LoyaltyRule đang active, không thể tạo mới.");
          }

          LoyaltyRule rule = LoyaltyRule.builder()
                  .pointsPerAmount(request.getAmountMoney())
                  .pointsEarned(request.getPointsEarn())
                  .moneyReturn(request.getReturnMoney())
                  .build();

          LoyaltyRule saved = loyaltyRuleRepository.save(rule);

          return LoyaltyRuleResponse.builder()
                  .id(saved.getId())
                  .amountMoney(saved.getPointsPerAmount())
                  .pointsEarn(saved.getPointsEarned())
                  .returnMoney(saved.getMoneyReturn())
                  .isActive(saved.getIsActive())
                  .build();
     }
     @Override
     @Transactional
     public String updateRule(Integer id, LoyaltyRuleRequest request) {
          LoyaltyRule rule = loyaltyRuleRepository.findById(id)
                  .orElseThrow(() -> new AppException(ErrorHandler.LOYALTY_RULE_NOT_FOUND, "Không tìm thấy luật nào."));

          rule.setPointsPerAmount(request.getAmountMoney());
          rule.setPointsEarned(request.getPointsEarn());
          rule.setMoneyReturn(request.getReturnMoney());
          rule.setUpdatedAt(LocalDateTime.now());

          LoyaltyRule saved = loyaltyRuleRepository.save(rule);

          return "Đã cập nhật thành công";
     }
     @Override
     public List<LoyaltyRuleResponse> viewRuleList() {
          List<LoyaltyRule> rules = loyaltyRuleRepository.findAll();
          if (rules.isEmpty()) {
               throw new AppException(ErrorHandler.LIST_EMPTY, "Danh sách LoyaltyRule trống.");
          }
          return rules.stream()
                  .map(rule -> LoyaltyRuleResponse.builder()
                          .id(rule.getId())
                          .amountMoney(rule.getPointsPerAmount())
                          .pointsEarn(rule.getPointsEarned())
                          .returnMoney(rule.getMoneyReturn())
                          .isActive(rule.getIsActive())
                          .build())
                  .collect(Collectors.toList());
     }

     @Override
     public void turnOnOffLoyaltyRule(Integer loyaltyRuleId) {
          LoyaltyRule loyaltyRule = loyaltyRuleRepository.findById(loyaltyRuleId).orElseThrow(() -> new AppException(ErrorHandler.LOYALTY_RULE_NOT_FOUND, "Không tìm thấy luật nào."));
          LoyaltyRule loyaltyRuleInActive= loyaltyRuleRepository.findByIsActive(true);
          if (loyaltyRuleInActive!=null && !loyaltyRule.getIsActive()) {throw new AppException(ErrorHandler.ONLY_ONE_RULE_ACTIVE,"Chỉ có 1 luật mới đươc hoạt động");}
          loyaltyRule.setIsActive(!loyaltyRule.getIsActive());
          loyaltyRuleRepository.save(loyaltyRule);
     }

     @Override
     @Transactional
     public void deleteRule(Integer loyaltyRuleId) {
          LoyaltyRule rule = loyaltyRuleRepository.findById(loyaltyRuleId)
                  .orElseThrow(() -> new AppException(ErrorHandler.LOYALTY_RULE_NOT_FOUND, "Không tìm thấy luật nào."));
          if (Boolean.TRUE.equals(rule.getIsActive())) {
               throw new AppException(ErrorHandler.LOYALTY_RULE_IN_ACTIVE, "Phải tắt luật trước khi xóa.");
          }
          loyaltyRuleRepository.delete(rule);
     }



}

