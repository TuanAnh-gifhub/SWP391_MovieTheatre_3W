package movie.swp391.repository;

import movie.swp391.entity.PromotionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionGroupRepository extends JpaRepository<PromotionGroup, Integer> {
    Optional<PromotionGroup> findByGroupCode(String groupCode);
    boolean existsByGroupCode(String groupCode);
    @Query("SELECT DISTINCT g.groupCode FROM PromotionGroup g")
    List<String> findAllGroupCodes();

}

