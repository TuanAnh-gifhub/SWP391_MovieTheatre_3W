package movie.swp391.serviceImp;

import jakarta.transaction.Transactional;
import movie.swp391.constant.PromotionStatus;
import movie.swp391.constant.PromotionType;
import movie.swp391.entity.*;
import movie.swp391.entity.*;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.mapper.PromotionMapper;
import movie.swp391.repository.*;
import movie.swp391.repository.*;
import movie.swp391.request.promotion.PromotionCreateDto;
import movie.swp391.request.promotion.PromotionDto;
import movie.swp391.request.promotion.PromotionGroupAssignRequest;
import movie.swp391.response.promotion.ConditionResponse;
import movie.swp391.response.promotion.PromotionGroupResponse;
import movie.swp391.response.promotion.PromotionResponse;
import movie.swp391.service.PromotionService;
import movie.swp391.validation.PromotionApplicabilityChecker;
import movie.swp391.validation.PromotionConditionParser;
import movie.swp391.validation.PromotionConditionValidatorFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;


@Service
public class PromotionServiceImpl implements PromotionService {

    @Autowired
    private PromotionMapper promotionMapper;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private PromotionGroupRepository promotionGroupRepository;

    @Autowired
    private PromotionConditionValidatorFactory validatorFactory;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private PromotionApplicabilityChecker promotionApplicabilityChecker;

    @Autowired
    private PromotionConditionParser promotionConditionParser;

    @Autowired
    private PromotionUsageRepository promotionUsageRepository;

    @Override
    public List<ConditionResponse> getAvailableConditionDetails() {
        return validatorFactory.getAvailableConditionDetails();
    }

    @Override
    public List<Promotion> getValidPromotions() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findValidPromotions(now);
    }

    @Override
    public List<PromotionGroupResponse> getAllGroupDetailsWithPromotionDtos() {
        List<PromotionGroup> groups = promotionGroupRepository.findAll();

        return groups.stream().map(group -> {
            List<PromotionDto> promotionDtos = group.getPromotions() != null
                    ? group.getPromotions().stream()
                    .filter(p -> !PromotionStatus.DELETED.equalsIgnoreCase(p.getStatus()))
                    .map(promotionMapper::toPromotionDto)
                    .toList()
                    : List.of();

            return PromotionGroupResponse.builder()
                    .id(group.getId())
                    .groupCode(group.getGroupCode())
                    .description(group.getDescription())
                    .promotions(promotionDtos)
                    .build();
        }).toList();
    }
    @Override
    public void assignPromotionToGroup(PromotionGroupAssignRequest request) {
        PromotionGroup group = promotionGroupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new AppException(ErrorHandler.NOT_FOUND, "Không tìm thấy group"));

        List<Promotion> promotions = promotionRepository.findAllById(request.getPromotionIds());

        if (promotions.isEmpty()) {
            throw new AppException(ErrorHandler.NOT_FOUND, "Không tìm thấy promotions hợp lệ");
        }

        for (Promotion promotion : promotions) {
            if (Boolean.TRUE.equals(promotion.getIsExclusive())) {
                throw new AppException(ErrorHandler.INVALID_KEY,
                        "Promotion ID " + promotion.getPromotionID() + " là exclusive nên không thể gán vào group");
            }
            promotion.setGroup(group);
        }

        promotionRepository.saveAll(promotions);
    }
    @Override
    @Transactional
    public void unassignPromotionFromGroup(PromotionGroupAssignRequest request) {
        PromotionGroup group = promotionGroupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new AppException(ErrorHandler.NOT_FOUND, "Không tìm thấy group"));

        List<Promotion> promotions = promotionRepository.findAllById(request.getPromotionIds());

        if (promotions.isEmpty()) {
            throw new AppException(ErrorHandler.NOT_FOUND, "Không tìm thấy promotions hợp lệ");
        }

        for (Promotion promotion : promotions) {
            if (promotion.getGroup() == null || !promotion.getGroup().getId().equals(group.getId())) {
                throw new AppException(ErrorHandler.INVALID_KEY,
                        "Promotion ID " + promotion.getPromotionID() + " không thuộc group cần gỡ");
            }

            promotion.setGroup(null); // Gỡ liên kết
        }

        promotionRepository.saveAll(promotions);
    }


    @Override
    public PromotionGroup createGroup(String groupCode, String description) {
        if (promotionGroupRepository.existsByGroupCode(groupCode)) {
            throw new AppException(ErrorHandler.INVALID_KEY, "Group code đã tồn tại trước đó");
        }
        PromotionGroup group = new PromotionGroup();
        group.setGroupCode(groupCode);
        group.setDescription(description);
        return promotionGroupRepository.save(group);
    }

    @Override
    public PromotionGroup updateGroup(Integer id, String groupCode, String description) {
        PromotionGroup group = promotionGroupRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorHandler.NOT_FOUND, "Không tìm thấy Group code"));

        if (!group.getGroupCode().equals(groupCode) &&
                promotionGroupRepository.existsByGroupCode(groupCode)) {
            throw new AppException(ErrorHandler.INVALID_KEY, "Group code đã tồn tại trước đó");
        }

        group.setGroupCode(groupCode);
        group.setDescription(description);
        return promotionGroupRepository.save(group);
    }

    @Override
    @Transactional
    public void deleteGroup(Integer id) {
        PromotionGroup group = promotionGroupRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorHandler.NOT_FOUND, "Không tìm thấy Group code"));

        // Bước 1: Tìm các promotion chưa bị xoá mềm
        List<Promotion> activePromotions = promotionRepository.findAllByGroupAndStatusNot(group, PromotionStatus.DELETED);

        if (!activePromotions.isEmpty()) {
            // Nếu còn promotion đang hoạt động dùng group → cản xoá
            StringBuilder message = new StringBuilder();
            message.append("❌ Không thể xoá GroupCode [").append(group.getGroupCode()).append("], vì đang được sử dụng bởi các khuyến mãi sau:\n");
            for (Promotion p : activePromotions) {
                message.append("- ID: ").append(p.getPromotionID()).append(", Title: ").append(p.getTitle()).append("\n");
            }
            message.append("→ Vui lòng gỡ groupCode khỏi các khuyến mãi này trước khi xoá.");
            throw new AppException(ErrorHandler.INVALID_KEY, message.toString());
        }

        // Bước 2: Gỡ group khỏi các promotion đã bị xoá mềm
        List<Promotion> deletedPromotions = promotionRepository.findAllByGroupAndStatus(group, PromotionStatus.DELETED);
        if (!deletedPromotions.isEmpty()) {
            for (Promotion p : deletedPromotions) {
                p.setGroup(null);
            }
            promotionRepository.saveAll(deletedPromotions);
        }

        // Bước 3: Xoá group
        promotionGroupRepository.delete(group);
    }


    @Override
    public List<PromotionResponse> getAllPromotions() {
        List<Promotion> promotions = promotionRepository.findByStatusNot(PromotionStatus.DELETED);

        if (promotions.isEmpty()) {
            throw new AppException(ErrorHandler.LIST_EMPTY);
        }

        return promotions.stream()
                .map(promotion -> PromotionResponse.builder()
                        .promotionId(promotion.getPromotionID())
                        .title(promotion.getTitle())
                        .startTime(promotion.getStartTime())
                        .endTime(promotion.getEndTime())
                        .value(promotion.getValue())
                        .maxDiscountAmount(promotion.getMaxDiscountAmount())
                        .detail(promotion.getDetail())
                        .image(promotion.getImage())
                        .isExclusive(promotion.getIsExclusive())
                        .groupCode(promotion.getGroup() != null ? promotion.getGroup().getGroupCode() : null)
                        .promotionType(promotion.getPromotionType())
                        .maxTotalUsage(promotion.getMaxTotalUsage())
                        .maxUsagePerCustomer(promotion.getMaxUsagePerCustomer())
                        .condition(promotionMapper.toConditionMap(promotion.getCondition()))
                        .status(promotion.getStatus().toString())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public void deactivatePromotion(Integer promotionId) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new AppException(ErrorHandler.DATE_NOT_EXIST));

        if (PromotionStatus.DELETED.equalsIgnoreCase(promotion.getStatus())) {
            throw new AppException(ErrorHandler.INVALID_KEY, "Promotion đã bị xoá, không thể thay đổi trạng thái.");
        }

        if (PromotionStatus.ACTIVE.equalsIgnoreCase(promotion.getStatus())) {
            promotion.setStatus(PromotionStatus.INACTIVE);
        } else if (PromotionStatus.INACTIVE.equalsIgnoreCase(promotion.getStatus())) {
            promotion.setStatus(PromotionStatus.ACTIVE);
        }

        promotionRepository.save(promotion);
    }


    @Override
    public PromotionDto createPromotion(PromotionCreateDto dto) {
        validateCreatePromotion(dto);
        Promotion promotion = promotionMapper.toEntity(dto);
        promotion.setStatus(PromotionStatus.ACTIVE);

        // Bỏ gán group vì không còn groupCode trong DTO
        promotion.setGroup(null);

        Promotion saved = promotionRepository.save(promotion);
        return promotionMapper.toPromotionDto(saved);
    }

    @Override
    public void deletePromotion(Integer id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorHandler.DATE_NOT_EXIST));

        promotion.setStatus(PromotionStatus.DELETED);
        promotionRepository.save(promotion);
    }

    @Override
    public PromotionDto updatePromotion(Integer id, PromotionDto dto) {
        // Lấy entity gốc từ DB
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorHandler.DATE_NOT_EXIST));

        // Validate dữ liệu
        validateUpdatePromotion(dto);
        validateStatus(dto.getStatus());

        // ✅ Cập nhật các field được phép sửa
        promotion.setTitle(dto.getTitle());
        promotion.setStartTime(dto.getStartTime());
        promotion.setEndTime(dto.getEndTime());
        promotion.setValue(dto.getValue());
        promotion.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        promotion.setDetail(dto.getDetail());
        promotion.setImage(dto.getImage());
        promotion.setIsExclusive(dto.getIsExclusive());
        promotion.setPromotionType(dto.getPromotionType());
        promotion.setMaxTotalUsage(dto.getMaxTotalUsage());
        promotion.setMaxUsagePerCustomer(dto.getMaxUsagePerCustomer());
        promotion.setStatus(dto.getStatus());
        promotion.setCondition(promotionMapper.toConditionString(dto.getCondition()));

        // ✅ Xử lý group logic: nếu là exclusive thì set null, nếu có groupCode thì set lại, còn không thì giữ nguyên
        if (Boolean.TRUE.equals(promotion.getIsExclusive())) {
            promotion.setGroup(null);
        } else if (dto.getGroupCode() != null && !dto.getGroupCode().trim().isEmpty()) {
            PromotionGroup group = promotionGroupRepository.findByGroupCode(dto.getGroupCode())
                    .orElseThrow(() -> new AppException(ErrorHandler.INVALID_KEY, "Group code không tồn tại"));
            promotion.setGroup(group);
        }

        // ✅ Lưu và trả về
        promotionRepository.save(promotion);
        return promotionMapper.toPromotionDto(promotion);
    }

    private void validateStatus(String status) {
        if (!PromotionStatus.VALID_STATUSES.contains(status.toUpperCase())) {
            throw new AppException(ErrorHandler.INVALID_KEY, "Invalid promotion status: " + status);
        }
    }

    private void validatePromotionType(String promotionType) {
        if (!PromotionType.VALID_TYPES.contains(promotionType.toUpperCase())) {
            throw new AppException(ErrorHandler.PROMOTION_TYPE_INVALID);
        }
    }

    private void validatePromotionConditions(Map<String, Object> condition) {
        if (condition == null || condition.isEmpty()) {
            throw new AppException(ErrorHandler.PROMOTION_CONDITION_REQUIRED);
        }

        for (Map.Entry<String, Object> entry : condition.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();

            if (validatorFactory.containsValidator(key)) {
                validatorFactory.getValidator(key).validate(value);
            } else {
                throw new AppException(ErrorHandler.INVALID_KEY, "Unsupported condition key: " + key);
            }
        }
    }

    private void validateCreatePromotion(PromotionCreateDto dto) {
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            throw new AppException(ErrorHandler.PROMOTION_TITLE_REQUIRED);
        }
        if (dto.getDetail() == null || dto.getDetail().trim().isEmpty()) {
            throw new AppException(ErrorHandler.PROMOTION_DETAIL_REQUIRED);
        }
        if (!PromotionType.COMBO.equalsIgnoreCase(dto.getPromotionType()) && dto.getValue() <= 0) {
            throw new AppException(ErrorHandler.PROMOTION_VALUE_INVALID);
        }
        if (dto.getImage() == null || dto.getImage().trim().isEmpty()) {
            throw new AppException(ErrorHandler.PROMOTION_IMAGE_REQUIRED);
        }
        if (dto.getPromotionType() == null || dto.getPromotionType().trim().isEmpty()) {
            throw new AppException(ErrorHandler.PROMOTION_TYPE_REQUIRED);
        }
        validatePromotionType(dto.getPromotionType());

        if (dto.getEndTime().isBefore(dto.getStartTime())) {
            throw new AppException(ErrorHandler.PROMOTION_TIME_INVALID);
        }
        if (dto.getEndTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorHandler.PROMOTION_END_TIME_INVALID);
        }
        if (dto.getCondition() == null) {
            throw new AppException(ErrorHandler.PROMOTION_CONDITION_REQUIRED);
        }
        if (dto.getIsExclusive() == null) {
            throw new AppException(ErrorHandler.INVALID_KEY, "isExclusive không được null");
        }
        if ("FIXED_AMOUNT".equalsIgnoreCase(dto.getPromotionType()) && dto.getMaxDiscountAmount() != null) {
            throw new AppException(ErrorHandler.INVALID_KEY, "Không được set maxDiscountAmount nếu promotionType là FIXED_AMOUNT");
        }
        // ✅ maxTotalUsage: phải ≥ 0 nếu có
        if (dto.getMaxTotalUsage() != null && dto.getMaxTotalUsage() < 0) {
            throw new AppException(ErrorHandler.INVALID_KEY, "Giới hạn tổng lượt sử dụng không hợp lệ (phải ≥ 0)");
        }

        // ✅ maxUsagePerCustomer: phải ≥ 0 nếu có
        if (dto.getMaxUsagePerCustomer() != null && dto.getMaxUsagePerCustomer() < 0) {
            throw new AppException(ErrorHandler.INVALID_KEY, "Giới hạn lượt sử dụng mỗi khách không hợp lệ (phải ≥ 0)");
        }

        validatePromotionConditions(dto.getCondition());
    }

    private void validateUpdatePromotion(PromotionDto dto) {
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            throw new AppException(ErrorHandler.PROMOTION_TITLE_REQUIRED);
        }
        if (dto.getDetail() == null || dto.getDetail().trim().isEmpty()) {
            throw new AppException(ErrorHandler.PROMOTION_DETAIL_REQUIRED);
        }
        if (!PromotionType.COMBO.equalsIgnoreCase(dto.getPromotionType()) && dto.getValue() <= 0) {
            throw new AppException(ErrorHandler.PROMOTION_VALUE_INVALID);
        }
        if (dto.getImage() == null || dto.getImage().trim().isEmpty()) {
            throw new AppException(ErrorHandler.PROMOTION_IMAGE_REQUIRED);
        }
        if (dto.getPromotionType() == null || dto.getPromotionType().trim().isEmpty()) {
            throw new AppException(ErrorHandler.PROMOTION_TYPE_REQUIRED);
        }
        validatePromotionType(dto.getPromotionType());

        if (dto.getEndTime().isBefore(dto.getStartTime())) {
            throw new AppException(ErrorHandler.PROMOTION_TIME_INVALID);
        }
        if (dto.getEndTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorHandler.PROMOTION_END_TIME_INVALID);
        }

        if (dto.getIsExclusive() == null) {
            throw new AppException(ErrorHandler.INVALID_KEY, "isExclusive không được null");
        }

        if (Boolean.TRUE.equals(dto.getIsExclusive())
                && dto.getGroupCode() != null
                && !dto.getGroupCode().trim().isEmpty()) {
            throw new AppException(ErrorHandler.INVALID_KEY, "Không được khai báo groupCode nếu isExclusive = true");
        }

        if (PromotionStatus.ACTIVE.equalsIgnoreCase(dto.getStatus())) {
            if (dto.getEndTime().isBefore(LocalDateTime.now())) {
                throw new AppException(ErrorHandler.INVALID_KEY, "Không thể set status = ACTIVE khi endTime < thời điểm hiện tại");
            }
        }

        if (PromotionStatus.EXPIRED.equalsIgnoreCase(dto.getStatus())) {
            if (dto.getEndTime().isAfter(LocalDateTime.now())) {
                throw new AppException(ErrorHandler.INVALID_KEY, "Không thể set status = EXPIRED khi endTime vẫn còn hiệu lực");
            }
        }
        if (Boolean.FALSE.equals(dto.getIsExclusive())) {
            if (dto.getGroupCode() != null && !dto.getGroupCode().trim().isEmpty()) {
                boolean exists = promotionGroupRepository.existsByGroupCode(dto.getGroupCode().trim());
                if (!exists) {
                    throw new AppException(ErrorHandler.INVALID_KEY, "Group code không tồn tại");
                }
            }
        }
        if ("FIXED_AMOUNT".equalsIgnoreCase(dto.getPromotionType()) && dto.getMaxDiscountAmount() != null) {
            throw new AppException(ErrorHandler.INVALID_KEY, "Không được set maxDiscountAmount nếu promotionType là FIXED_AMOUNT");
        }
        // ✅ maxTotalUsage: phải ≥ 0 nếu có
        if (dto.getMaxTotalUsage() != null && dto.getMaxTotalUsage() < 0) {
            throw new AppException(ErrorHandler.INVALID_KEY, "Giới hạn tổng lượt sử dụng không hợp lệ (phải ≥ 0)");
        }

        // ✅ maxUsagePerCustomer: phải ≥ 0 nếu có
        if (dto.getMaxUsagePerCustomer() != null && dto.getMaxUsagePerCustomer() < 0) {
            throw new AppException(ErrorHandler.INVALID_KEY, "Giới hạn lượt sử dụng mỗi khách không hợp lệ (phải ≥ 0)");
        }

        validatePromotionConditions(dto.getCondition());
    }

    @Override
    public List<PromotionDto> getValidPromotionsForPreview(
            Integer customerId,
            Integer movieId,
            Integer cinemaRoomId,
            LocalDate showDate,
            LocalTime showTime,
            List<Integer> seatIds
    ) {
        List<Seat> seats = seatRepository.findAllById(seatIds);
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorHandler.CUSTOMER_NOT_FOUND));

        Showtime showtime = showtimeRepository.findMatchingShowtime(
                movieId, showDate, showTime, cinemaRoomId
        );

        if (showtime == null) {
            throw new AppException(ErrorHandler.NOT_FOUND, "Showtime");
        }
        if (seats.isEmpty()) {
            throw new AppException(ErrorHandler.NOT_FOUND, "Không tìm thấy ghế nào.");
        }

        if (seats.size() != seatIds.size()) {
            throw new AppException(ErrorHandler.INVALID_KEY, "Một số ghế không hợp lệ hoặc không tồn tại.");
        }

        double totalPrice = seats.stream()
                .mapToDouble(Seat::getPrice)
                .sum();

        List<Promotion> allValidPromotions = promotionRepository.findValidPromotions(LocalDateTime.now());

        return allValidPromotions.stream()
                .filter(promo -> promotionApplicabilityChecker.isApplicable(promo, customer, showtime, totalPrice))
                // Loại bỏ promotion đã hết lượt dùng toàn hệ thống
                .filter(promo -> promo.getMaxTotalUsage() == null || promo.getUsedCount() < promo.getMaxTotalUsage())

                // Loại bỏ promotion mà khách đã dùng quá số lượt
                .filter(promo -> {
                    if (promo.getMaxUsagePerCustomer() == null) return true;
                    int used = promotionUsageRepository
                            .findByPromotionAndCustomer(promo, customer)
                            .map(PromotionUsage::getUsageCount)
                            .orElse(0);
                    return used < promo.getMaxUsagePerCustomer();
                })

                .map(this::convertToDto)
                .toList();
    }


    private PromotionDto convertToDto(Promotion promo) {
        return PromotionDto.builder()
                .promotionId(promo.getPromotionID())
                .title(promo.getTitle())
                .value(promo.getValue())
                .maxDiscountAmount(promo.getMaxDiscountAmount())
                .promotionType(promo.getPromotionType())
                .groupCode(promo.getGroup() != null ? promo.getGroup().getGroupCode() : null)
                .isExclusive(promo.getIsExclusive())
                .startTime(promo.getStartTime())
                .endTime(promo.getEndTime())
                .image(promo.getImage())
                .detail(promo.getDetail())
                .condition(promotionConditionParser.parse(promo.getCondition()))
                .status(promo.getStatus())
                .build();
    }

    @Override
    @Transactional
    public void applyPromotion(Promotion promotion, Customer customer) {
        // Kiểm tra tổng lượt dùng
        if (promotion.getMaxTotalUsage() != null &&
                promotion.getUsedCount() >= promotion.getMaxTotalUsage()) {
            throw new AppException(ErrorHandler.INVALID_KEY, "Khuyến mãi đã hết lượt sử dụng");
        }

        // Kiểm tra lượt dùng của từng khách
        if (promotion.getMaxUsagePerCustomer() != null) {
            PromotionUsage usage = promotionUsageRepository
                    .findByPromotionAndCustomer(promotion, customer)
                    .orElse(new PromotionUsage(
                            new PromotionUsageKey(promotion.getPromotionID(), customer.getCustomerID()),
                            promotion, customer, 0
                    ));

            if (usage.getUsageCount() >= promotion.getMaxUsagePerCustomer()) {
                throw new AppException(ErrorHandler.INVALID_KEY, "Bạn đã sử dụng hết lượt khuyến mãi này");
            }

            usage.setUsageCount(usage.getUsageCount() + 1);
            promotionUsageRepository.save(usage);
        }

        // Tăng tổng số lượt dùng
        promotion.setUsedCount(promotion.getUsedCount() + 1);

        // Nếu đạt giới hạn tổng, tự động set INACTIVE
        if (promotion.getMaxTotalUsage() != null &&
                promotion.getUsedCount() >= promotion.getMaxTotalUsage()) {
            promotion.setStatus(PromotionStatus.INACTIVE);
        }

        promotionRepository.save(promotion);
    }
}

