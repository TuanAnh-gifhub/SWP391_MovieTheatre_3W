package movie.swp391.repository;

import movie.swp391.entity.SeatType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatTypeRepository extends JpaRepository<SeatType, Integer> {
	List<SeatType> findAllByOrderBySortOrderAscNameAsc();

	Optional<SeatType> findByCodeIgnoreCase(String code);

	Optional<SeatType> findByNameIgnoreCase(String name);

	boolean existsByCodeIgnoreCase(String code);

	boolean existsByNameIgnoreCase(String name);
}

