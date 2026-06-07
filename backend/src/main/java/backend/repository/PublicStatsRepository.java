package backend.repository;

import backend.model.PublicStats;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PublicStatsRepository extends JpaRepository<PublicStats, Long> {

    Optional<PublicStats> findByStatKey(String statKey);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM PublicStats s WHERE s.statKey = :statKey")
    Optional<PublicStats> findByStatKeyForUpdate(@Param("statKey") String statKey);
}
