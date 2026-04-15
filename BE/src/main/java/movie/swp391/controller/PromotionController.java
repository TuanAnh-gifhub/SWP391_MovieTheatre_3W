package movie.swp391.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import movie.swp391.request.promotion.PromotionCreateDto;
import movie.swp391.request.promotion.PromotionDto;
import movie.swp391.request.promotion.PromotionGroupAssignRequest;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.response.promotion.ConditionResponse;
import movie.swp391.response.promotion.PromotionResponse;
import movie.swp391.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@Validated // Bắt buộc để validate @RequestParam
@EnableMethodSecurity(prePostEnabled = true)
public class PromotionController {


    @Autowired
    private PromotionService promotionService;


    // POST /api/promotions
    @PostMapping("/create-promotion")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'ADD_PROMOTION')")
    public PromotionDto createPromotion(@RequestBody @Valid PromotionCreateDto promotionDto) throws JsonProcessingException {
        return promotionService.createPromotion(promotionDto);
    }


    // DELETE /api/promotions/{id}
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'DELETE_PROMOTION')")
    public void deletePromotion(@PathVariable Integer id) {
        promotionService.deletePromotion(id);
    }


    // PUT /api/promotions/update
    @PutMapping("/update")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_PROMOTION')")
    public PromotionDto updatePromotion(
            @RequestBody @Valid PromotionDto promotionDto
    ) throws JsonProcessingException {
        return promotionService.updatePromotion(promotionDto.getPromotionId(), promotionDto);
    }

    // GET /api/promotions/get-all-for-admin
    @GetMapping("/get-all-promotions")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_PROMOTION')")
    public List<PromotionResponse> getAllPromotions() throws JsonProcessingException {
        return promotionService.getAllPromotions();
    }


    @GetMapping("/get-all-promotions-guest")
    @PreAuthorize("permitAll()")
    public List<PromotionResponse> getAllPromotionsGuest() throws JsonProcessingException {
        return promotionService.getAllPromotions();
    }

    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_PROMOTION_CONDITION')")
    @GetMapping("/conditions")
    public List<ConditionResponse> getPromotionConditions() {
        return promotionService.getAvailableConditionDetails();
    }


    @PostMapping("/group/create-group")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'ADD_PROMOTION_GROUP')")
    public ResponseEntity<BaseResponse<?>> createGroup(
            @RequestParam @NotBlank(message = "groupCode is required") String groupCode,
            @RequestParam(required = false) String description
    ) {
        return ResponseEntity.ok(new BaseResponse<>("Tạo group thành công", true,
                promotionService.createGroup(groupCode, description)));
    }

    @PutMapping("/group/update/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_PROMOTION_GROUP')")
    public ResponseEntity<BaseResponse<?>> updateGroup(
            @PathVariable Integer id,
            @RequestParam @NotBlank(message = "groupCode is required") String groupCode,
            @RequestParam(required = false) String description
    ) {
        return ResponseEntity.ok(new BaseResponse<>("Cập nhật group thành công", true,
                promotionService.updateGroup(id, groupCode, description)));
    }

    @DeleteMapping("/group/delete/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'DELETE_PROMOTION_GROUP')")
    public ResponseEntity<BaseResponse<String>> deleteGroup(@PathVariable Integer id) {
        promotionService.deleteGroup(id);
        return ResponseEntity.ok(new BaseResponse<>("Xóa group thành công", true, null));
    }

    @GetMapping("/group/list")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_PROMOTION_GROUP')")
    public ResponseEntity<BaseResponse<?>> getAllGroupsWithPromotions() {
        return ResponseEntity.ok(new BaseResponse<>("Danh sách group", true,
                promotionService.getAllGroupDetailsWithPromotionDtos()));
    }

    @PostMapping("/group/assign")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_PROMOTION_GROUP')")
    public ResponseEntity<BaseResponse<?>> assignPromotionToGroup(@RequestBody PromotionGroupAssignRequest request) {
        promotionService.assignPromotionToGroup(request);
        return ResponseEntity.ok(new BaseResponse<>("Gán promotion vào group thành công", true, null));
    }

    @PostMapping("/unassign-promotions")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_PROMOTION_GROUP')")
    public ResponseEntity<BaseResponse<String>> unassignPromotions(@RequestBody PromotionGroupAssignRequest request) {
        promotionService.unassignPromotionFromGroup(request);
        return ResponseEntity.ok(new BaseResponse<>("Đã gỡ promotion khỏi group thành công", true, null));
    }

    @PutMapping("/deactivate/{promotionId}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_PROMOTION')")
    public ResponseEntity<BaseResponse<String>> deactivatePromotion(@PathVariable Integer promotionId) {
        promotionService.deactivatePromotion(promotionId);
        return ResponseEntity.ok(new BaseResponse<>("Đã chuyển trạng thái promotion thành công", true, null));
    }

}
