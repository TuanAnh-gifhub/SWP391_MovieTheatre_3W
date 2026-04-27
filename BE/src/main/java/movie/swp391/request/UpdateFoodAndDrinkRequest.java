package movie.swp391.request;

import lombok.Data;
@Data
public class UpdateFoodAndDrinkRequest {
    private String name;
    private String description;
    private Double price;
    private String type;
    private String image;
    private Boolean active;
}
