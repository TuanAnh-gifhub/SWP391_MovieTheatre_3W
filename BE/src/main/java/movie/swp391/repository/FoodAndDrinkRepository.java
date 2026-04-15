package movie.swp391.repository;

import movie.swp391.entity.FoodAndDrink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodAndDrinkRepository extends JpaRepository<FoodAndDrink, Integer> {
    List<FoodAndDrink> findByActiveTrue();
    List<FoodAndDrink> findByTypeAndActiveTrue(String type);
}