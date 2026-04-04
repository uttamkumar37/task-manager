package backend.repository;

import backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

	List<Task> findByOwnerUsernameOrderByCreatedAtDesc(String ownerUsername);

	List<Task> findByOwnerUsernameAndStatusOrderByCreatedAtDesc(String ownerUsername, String status);

	java.util.Optional<Task> findByIdAndOwnerUsername(Long id, String ownerUsername);

	@Query("SELECT t FROM Task t WHERE t.ownerUsername = :ownerUsername AND (" +
			"LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
			"OR LOWER(COALESCE(t.description, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))")
	List<Task> searchByKeyword(@Param("ownerUsername") String ownerUsername, @Param("keyword") String keyword);

	long countByOwnerUsername(String ownerUsername);

	long countByOwnerUsernameAndStatus(String ownerUsername, String status);
}

