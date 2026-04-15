package movie.swp391.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.request.LoyaltyRuleRequest;
import movie.swp391.response.ApiResponse;
import movie.swp391.response.LoyaltyRuleResponse;
import movie.swp391.service.CouponService;
import movie.swp391.service.LoyaltyRuleService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/loyalty-rule")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class LoyaltyRuleController {

    CouponService couponService;
    LoyaltyRuleService loyaltyRuleService;


    @PostMapping("/create")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'CREATE_LOYALTY_RULE')")
    public ApiResponse<LoyaltyRuleResponse> createRule(@RequestBody @Valid LoyaltyRuleRequest request) {
        return ApiResponse.<LoyaltyRuleResponse>builder()
                .result(loyaltyRuleService.createRule(request))
                .message("Success")
                .status(200)
                .build();
    }

    @PutMapping("/update/{ruleId}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_LOYALTY_RULE')")
    public ApiResponse<String> updateLoyaltyTier(@PathVariable Integer ruleId ,@RequestBody @Valid LoyaltyRuleRequest request) {
        return ApiResponse.<String>builder()
                .result(loyaltyRuleService.updateRule(ruleId, request))
                .message("Success")
                .status(200)
                .build();


    }
    @PutMapping("/on-off-rule")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_LOYALTY_RULE')")
    public ApiResponse<String> onOffRule(@RequestBody Integer ruleId) {
        loyaltyRuleService.turnOnOffLoyaltyRule(ruleId);
        return ApiResponse.<String>builder()
                .result("Cập nhật thành công")
                .message("Cập nhật thành công")
                .build();
    }

    @PostMapping("/view-all")
    @PreAuthorize("permitAll()")
    public ApiResponse<List<LoyaltyRuleResponse>> viewALl() {
        return ApiResponse.<List<LoyaltyRuleResponse>>builder()
                .result(loyaltyRuleService.viewRuleList())
                .message("Success")
                .status(200)
                .build();
    }

    @DeleteMapping("/delete/{ruleId}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'DELETE_LOYALTY_RULE')")
    public ApiResponse<String> deleteLoyaltyTier(@PathVariable Integer ruleId) {
        loyaltyRuleService.deleteRule(ruleId);
        return ApiResponse.<String>builder()
                .result("Xóa luât thành công")
                .message("Success")
                .status(200)
                .build();
    }




}


