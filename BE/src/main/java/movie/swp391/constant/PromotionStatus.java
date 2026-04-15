package movie.swp391.constant;

import java.util.List;

public class PromotionStatus {
    public static final String ACTIVE = "ACTIVE";
    public static final String INACTIVE = "INACTIVE";
    public static final String EXPIRED = "EXPIRED";
    public static final String DELETED = "DELETED";
    public static final List<String> VALID_STATUSES = List.of(ACTIVE, INACTIVE, EXPIRED, DELETED);
}
