package movie.swp391.repository;

import movie.swp391.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByRoleName(String roleName);
    Optional<Role> findByRoleCode(String roleCode);
    boolean existsByRoleName(String roleName);
    boolean existsByRoleCode(String roleCode);
    Page<Role> findByRoleNameContainingIgnoreCaseOrRoleCodeContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String code, String desc, Pageable pageable);

    @Query("SELECT DISTINCT r FROM Role r LEFT JOIN FETCH r.permissions ORDER BY r.roleID ASC")
    List<Role> findAllWithPermissions();

    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.roleID = :roleId")
    Optional<Role> findByIdWithPermissions(@Param("roleId") Integer roleId);

    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE UPPER(r.roleName) = UPPER(:roleName)")
    Optional<Role> findByRoleNameWithPermissions(@Param("roleName") String roleName);
}
