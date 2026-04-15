package movie.swp391.repository;

import movie.swp391.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
 
@Repository
public interface PermissionRepository extends JpaRepository<Permission, Integer> {
    boolean existsByCode(String code);
} 