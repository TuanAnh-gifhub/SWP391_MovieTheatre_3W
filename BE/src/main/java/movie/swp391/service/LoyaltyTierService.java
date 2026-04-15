package movie.swp391.service;

import movie.swp391.request.LoyaltyTierRequest;
import movie.swp391.response.LoyaltyTierResponse;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;


public interface LoyaltyTierService {
    LoyaltyTierResponse createTier(LoyaltyTierRequest tier);

    String updateTier(Integer tierId, LoyaltyTierRequest request);

    void turnOnOffLoyalty(List<Integer> loyaltyTiersId);
    void deleteTier(Integer tierId);
    @PreAuthorize("permitAll()")
    List<LoyaltyTierResponse> getAllTiers();





}
