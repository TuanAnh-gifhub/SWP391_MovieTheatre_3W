package movie.swp391.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import movie.swp391.entity.Customer;
import movie.swp391.entity.Promotion;
import movie.swp391.entity.PromotionGroup;
import movie.swp391.request.promotion.PromotionCreateDto;
import movie.swp391.request.promotion.PromotionDto;
import movie.swp391.request.promotion.PromotionGroupAssignRequest;
import movie.swp391.response.promotion.ConditionResponse;
import movie.swp391.response.promotion.PromotionGroupResponse;
import movie.swp391.response.promotion.PromotionResponse;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface PromotionService {


    PromotionDto createPromotion(PromotionCreateDto promotionCreateDto) throws JsonProcessingException;


    void deletePromotion(Integer id);

    PromotionDto updatePromotion(Integer id, PromotionDto promotionDto) throws JsonProcessingException;

    List<PromotionResponse> getAllPromotions();

    List<ConditionResponse> getAvailableConditionDetails();

    void unassignPromotionFromGroup(PromotionGroupAssignRequest request);

    void deactivatePromotion(Integer promotionId);

    List<PromotionDto> getValidPromotionsForPreview(
            Integer customerId,
            Integer movieId,
            Integer cinemaRoomId,
            LocalDate showDate,
            LocalTime showTime,
            List<Integer> seatIds
    );


    List<Promotion> getValidPromotions();

    List<PromotionGroupResponse> getAllGroupDetailsWithPromotionDtos();


    PromotionGroup createGroup(String groupCode, String description);

    PromotionGroup updateGroup(Integer id, String groupCode, String description);

    void deleteGroup(Integer id);

    void assignPromotionToGroup(PromotionGroupAssignRequest request);

    void applyPromotion(Promotion promotion, Customer customer);
}
