package movie.swp391.constant;


import java.util.Arrays;
import java.util.List;

public class PromotionType {
    public static final String PERCENTAGE = "PERCENTAGE";
    public static final String FIXED_AMOUNT = "FIXED_AMOUNT";
    public static final String COMBO = "COMBO";

    public static final List<String> VALID_TYPES = Arrays.asList(
            PERCENTAGE, FIXED_AMOUNT, COMBO
    );
}

