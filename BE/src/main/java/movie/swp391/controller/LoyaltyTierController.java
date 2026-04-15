package movie.swp391.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.request.LoyaltyTierRequest;
import movie.swp391.response.LoyaltyTierResponse;
import movie.swp391.response.ApiResponse;
import movie.swp391.service.LoyaltyTierService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/loyalty-tier")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class LoyaltyTierController {

    LoyaltyTierService loyaltyTierService;


    @PostMapping("/create")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'CREATE_LOYALTY_TIER')")
    public ApiResponse<LoyaltyTierResponse> createLoyaltyTier(@RequestBody @Valid LoyaltyTierRequest request) {
        return ApiResponse.<LoyaltyTierResponse>builder()
                .result(loyaltyTierService.createTier(request))
                .message("Success")
                .status(200)
                .build();
    }

    @PutMapping("/update/{tierId}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_LOYALTY_TIER')")
    public ApiResponse<String> updateLoyaltyTier(@PathVariable Integer tierId ,@RequestBody @Valid LoyaltyTierRequest request) {
        return ApiResponse.<String>builder()
                .result(loyaltyTierService.updateTier(tierId, request))
                .message("Success")
                .status(200)
                .build();


    }
    @PutMapping("/on-off-loyalty")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_LOYALTY_TIER')")
    public ApiResponse<String> onOffLoyalty(@RequestBody List<Integer> loyaltyIds) {
        loyaltyTierService.turnOnOffLoyalty(loyaltyIds);
        return ApiResponse.<String>builder()
                .result("Cập nhật thành công")
                .message("Cập nhật thành công")
                .build();
    }

    @PostMapping("/view-all")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_LOYALTY_TIER')")
    public ApiResponse<List<LoyaltyTierResponse>> viewALl() {
        return ApiResponse.<List<LoyaltyTierResponse>>builder()
                .result(loyaltyTierService.getAllTiers())
                .message("Success")
                .status(200)
                .build();
    }

    @DeleteMapping("/delete/{tierId}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'DELETE_LOYALTY_TIER')")
    public ApiResponse<String> deleteLoyaltyTier(@PathVariable Integer tierId) {
        loyaltyTierService.deleteTier(tierId);
        return ApiResponse.<String>builder()
                .result("Xóa tier thành công")
                .message("Success")
                .status(200)
                .build();
    }


}


