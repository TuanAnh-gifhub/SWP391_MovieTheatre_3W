package movie.swp391.constant;

public enum PromotionConditionMeta {
    MIN_ORDER_AMOUNT("minOrderAmount", "Minimum Order Amount", "number"),
    APPLICABLE_ROLES("applicableRoles", "Applicable Roles", "select"),
    DAY_OF_WEEK("dayOfWeek", "Ngày áp dụng", "multi-select"),
    APPLICABLE_RANKS("applicableRanks", "Hạng thành viên áp dụng", "multi-select"),
    FIRST_BOOKING("firstBooking", "Khách hàng lần đầu đặt vé", "checkbox");

    private final String key;
    private final String displayName;
    private final String inputType;

    PromotionConditionMeta(String key, String displayName, String inputType) {
        this.key = key;
        this.displayName = displayName;
        this.inputType = inputType;
    }

    public String getKey() {
        return key;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getInputType() {
        return inputType;
    }

}

