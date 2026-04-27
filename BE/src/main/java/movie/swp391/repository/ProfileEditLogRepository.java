package movie.swp391.repository;

import movie.swp391.entity.ProfileEditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileEditLogRepository extends JpaRepository<ProfileEditLog, Long> {
}
