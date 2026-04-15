package movie.swp391.serviceImp;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.entity.Customer;
import movie.swp391.entity.LoyaltyTier;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.repository.LoyaltyTierRepository;
import movie.swp391.request.LoyaltyTierRequest;
import movie.swp391.response.LoyaltyTierResponse;
import movie.swp391.service.LoyaltyTierService;
import movie.swp391.service.MemberService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LoyaltyTierServiceImpl implements LoyaltyTierService {

LoyaltyTierRepository loyaltyTierRepository;
MemberService memberService;
     @Override
     public LoyaltyTierResponse createTier(LoyaltyTierRequest request) {

          boolean exists = loyaltyTierRepository.existsByNameIgnoreCase(request.getName());
          if (exists) {
               throw new AppException(ErrorHandler.DUPLICATE_LOYALTY_TIER_NAME, "Tên xếp hạng đã tồn tại.");
          }

          LoyaltyTier tier = LoyaltyTier.builder()
                  .name(request.getName())
                  .pointThreshold(request.getPointThreshold())
                  .discountPercent(request.getDiscountPercent())
                  .rankLink(request.getRankLink())
                  .isActive(true)
                  .build();

          LoyaltyTier saved = loyaltyTierRepository.save(tier);

          return LoyaltyTierResponse.builder()
                  .id(saved.getId())
                  .name(saved.getName())
                  .pointThreshold(saved.getPointThreshold())
                  .discountPercent(saved.getDiscountPercent())
                  .isActive(saved.getIsActive())
                  .rankLink(saved.getRankLink())
                  .createdAt(saved.getCreatedAt())
                  .updatedAt(saved.getUpdatedAt())
                  .build();
     }

     @Override
     @Transactional
     public String updateTier(Integer tierId, LoyaltyTierRequest request) {
          LoyaltyTier tier = loyaltyTierRepository.findById(tierId)
                  .orElseThrow(() -> new AppException(ErrorHandler.LOYALTY_TIER_NOT_FOUND));
          tier.setName(request.getName());
          tier.setPointThreshold(request.getPointThreshold());
          tier.setDiscountPercent(request.getDiscountPercent());
          tier.setUpdatedAt(LocalDateTime.now());
          tier.setRankLink(request.getRankLink());
          loyaltyTierRepository.save(tier);

          return "Cập nhật trung thành thành công.";
     }
     @Override
     public void turnOnOffLoyalty(List<Integer> loyaltyTierIds) {
          List<LoyaltyTier> loyaltyTiers = loyaltyTierRepository.findAllById(loyaltyTierIds);

          for (LoyaltyTier loyaltyTier : loyaltyTiers) {
               loyaltyTier.setIsActive(!loyaltyTier.getIsActive());

          }

          loyaltyTierRepository.saveAll(loyaltyTiers);
     }

    @Override
    @Transactional
    public void deleteTier(Integer tierId) {
        LoyaltyTier tier = loyaltyTierRepository.findById(tierId)
                .orElseThrow(() -> new AppException(ErrorHandler.LOYALTY_TIER_NOT_FOUND, "Không tìm thấy tier này."));
        if (tier.getCustomers() != null) {
            for (Customer customer : tier.getCustomers()) {
                customer.setLoyaltyTier(null);
            }
        }
        loyaltyTierRepository.delete(tier);
    }


     @Override
     public List<LoyaltyTierResponse> getAllTiers() {
          List<LoyaltyTier> tiers = loyaltyTierRepository.findAll(Sort.by("pointThreshold"));

          return tiers.stream()
                  .map(tier -> LoyaltyTierResponse.builder()
                          .id(tier.getId())
                          .name(tier.getName())
                          .pointThreshold(tier.getPointThreshold())
                          .discountPercent(tier.getDiscountPercent())
                          .rankLink(tier.getRankLink())
                          .isActive(tier.getIsActive())
                          .build())
                  .collect(Collectors.toList());
     }




     }

