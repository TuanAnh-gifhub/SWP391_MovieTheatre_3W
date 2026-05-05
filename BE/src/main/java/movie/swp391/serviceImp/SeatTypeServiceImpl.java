package movie.swp391.serviceImp;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.entity.SeatType;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.repository.SeatRepository;
import movie.swp391.repository.SeatTypeRepository;
import movie.swp391.request.SeatTypeRequest;
import movie.swp391.response.SeatTypeResponse;
import movie.swp391.service.SeatTypeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatTypeServiceImpl implements SeatTypeService {

    SeatTypeRepository seatTypeRepository;
    SeatRepository seatRepository;

    @Override
    public List<SeatTypeResponse> getAllSeatTypes() {
        return seatTypeRepository.findAllByOrderBySortOrderAscNameAsc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public SeatTypeResponse getSeatType(Integer seatTypeId) {
        SeatType seatType = seatTypeRepository.findById(seatTypeId)
                .orElseThrow(() -> new AppException(ErrorHandler.SEAT_TYPE_NOT_FOUND));
        return mapToResponse(seatType);
    }

    @Override
    @Transactional
    public SeatTypeResponse createSeatType(SeatTypeRequest request) {
        validateUnique(request.getCode(), request.getName(), null);

        SeatType seatType = SeatType.builder()
                .code(request.getCode().trim())
                .name(request.getName().trim())
                .description(normalizeBlank(request.getDescription()))
                .basePrice(request.getBasePrice() != null ? request.getBasePrice() : 0.0)
                .active(request.getActive() == null || request.getActive())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();
        return mapToResponse(seatTypeRepository.save(seatType));
    }

    @Override
    @Transactional
    public SeatTypeResponse updateSeatType(Integer seatTypeId, SeatTypeRequest request) {
        SeatType seatType = seatTypeRepository.findById(seatTypeId)
                .orElseThrow(() -> new AppException(ErrorHandler.SEAT_TYPE_NOT_FOUND));

        validateUnique(request.getCode(), request.getName(), seatTypeId);

        seatType.setCode(request.getCode().trim());
        seatType.setName(request.getName().trim());
        seatType.setDescription(normalizeBlank(request.getDescription()));
        seatType.setBasePrice(request.getBasePrice() != null ? request.getBasePrice() : 0.0);
        seatType.setActive(request.getActive() == null || request.getActive());
        seatType.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);

        return mapToResponse(seatTypeRepository.save(seatType));
    }

    @Override
    @Transactional
    public void deleteSeatType(Integer seatTypeId) {
        SeatType seatType = seatTypeRepository.findById(seatTypeId)
                .orElseThrow(() -> new AppException(ErrorHandler.SEAT_TYPE_NOT_FOUND));

        long seatCount = seatRepository.countBySeatTypeRef_SeatTypeID(seatType.getSeatTypeID());
        if (seatCount > 0) {
            throw new AppException(ErrorHandler.SEAT_TYPE_IN_USE,
                    "Seat type is in use by " + seatCount + " seat(s)");
        }

        seatTypeRepository.delete(seatType);
    }

    private void validateUnique(String code, String name, Integer currentId) {
        if (code != null) {
            seatTypeRepository.findByCodeIgnoreCase(code.trim()).ifPresent(existing -> {
                if (currentId == null || !currentId.equals(existing.getSeatTypeID())) {
                    throw new AppException(ErrorHandler.SEAT_TYPE_ALREADY_EXISTS,
                            "Seat type code already exists: " + code);
                }
            });
        }
        if (name != null) {
            seatTypeRepository.findByNameIgnoreCase(name.trim()).ifPresent(existing -> {
                if (currentId == null || !currentId.equals(existing.getSeatTypeID())) {
                    throw new AppException(ErrorHandler.SEAT_TYPE_ALREADY_EXISTS,
                            "Seat type name already exists: " + name);
                }
            });
        }
    }

    private SeatTypeResponse mapToResponse(SeatType seatType) {
        long seatCount = seatRepository.countBySeatTypeRef_SeatTypeID(seatType.getSeatTypeID());
        return SeatTypeResponse.builder()
                .seatTypeID(seatType.getSeatTypeID())
                .code(seatType.getCode())
                .name(seatType.getName())
                .description(seatType.getDescription())
                .basePrice(seatType.getBasePrice())
                .active(seatType.getActive())
                .sortOrder(seatType.getSortOrder())
                .seatCount(seatCount)
                .build();
    }

    private String normalizeBlank(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}



