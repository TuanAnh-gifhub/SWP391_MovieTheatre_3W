package movie.swp391.repository;

import movie.swp391.entity.Promotion;
import movie.swp391.entity.PromotionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Integer> {
    List<Promotion> findByStatusNot(String status);

    @Query("SELECT p FROM Promotion p WHERE p.status = 'ACTIVE' AND p.startTime <= :now AND p.endTime >= :now")
    List<Promotion> findValidPromotions(@Param("now") LocalDateTime now);

    List<Promotion> findAllByGroup(PromotionGroup group);

    @Query("SELECT p FROM Promotion p WHERE p.group = :group AND p.status <> :status")
    List<Promotion> findAllByGroupAndStatusNot(@Param("group") PromotionGroup group, @Param("status") String status);

    @Query("SELECT p FROM Promotion p WHERE p.group = :group AND p.status = :status")
    List<Promotion> findAllByGroupAndStatus(@Param("group") PromotionGroup group, @Param("status") String status);

}