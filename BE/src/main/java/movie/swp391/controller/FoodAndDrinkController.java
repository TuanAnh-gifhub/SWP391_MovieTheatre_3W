package movie.swp391.controller;

import lombok.RequiredArgsConstructor;
import movie.swp391.entity.FoodAndDrink;
import movie.swp391.repository.FoodAndDrinkRepository;
import movie.swp391.request.CreateFoodAndDrinkRequest;
import movie.swp391.request.UpdateFoodAndDrinkRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import movie.swp391.response.common.BaseResponse;

import java.util.List;

@RestController
@RequestMapping("/api/food-and-drink")
@RequiredArgsConstructor
public class FoodAndDrinkController {
    private final FoodAndDrinkRepository foodAndDrinkRepository;

    @GetMapping
    public ResponseEntity<List<FoodAndDrink>> getAll() {
        List<FoodAndDrink> list = foodAndDrinkRepository.findAll();
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @PreAuthorize("@permissionService.hasPermission(authentication, 'ADD_FOOD')")
    public ResponseEntity<BaseResponse<FoodAndDrink>> create(@RequestBody CreateFoodAndDrinkRequest req) {
        FoodAndDrink foodAndDrink = new FoodAndDrink();
        foodAndDrink.setName(req.getName());
        foodAndDrink.setDescription(req.getDescription());
        foodAndDrink.setPrice(req.getPrice());
        foodAndDrink.setType(req.getType());
        foodAndDrink.setImage(req.getImage());
        foodAndDrink.setActive(true);
        FoodAndDrink saved = foodAndDrinkRepository.save(foodAndDrink);
        return ResponseEntity.ok(new BaseResponse<>("Thêm thành công", true, saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_FOOD')")
    public ResponseEntity<BaseResponse<FoodAndDrink>> update(@PathVariable Integer id, @RequestBody UpdateFoodAndDrinkRequest req) {
        FoodAndDrink existing = foodAndDrinkRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        existing.setName(req.getName());
        existing.setPrice(req.getPrice());
        existing.setActive(req.getActive());
        existing.setDescription(req.getDescription());
        existing.setType(req.getType());
        existing.setImage(req.getImage());
        FoodAndDrink saved = foodAndDrinkRepository.save(existing);
        return ResponseEntity.ok(new BaseResponse<>("Cập nhật thành công", true, saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'DELETE_FOOD')")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!foodAndDrinkRepository.existsById(id)) {
            return ResponseEntity.status(404).body(new BaseResponse<>("Không tồn tại", false, null));
        }
        foodAndDrinkRepository.deleteById(id);
        return ResponseEntity.ok(new BaseResponse<>("Xóa thành công", true, null));
    }

    @PutMapping("/{id}/set-active")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_FOOD')")
    public ResponseEntity<FoodAndDrink> setActive(@PathVariable Integer id, @RequestParam boolean value) {
        FoodAndDrink foodAndDrink = foodAndDrinkRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        foodAndDrink.setActive(value);
        return ResponseEntity.ok(foodAndDrinkRepository.save(foodAndDrink));
    }
}