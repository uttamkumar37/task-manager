package backend.repository;

import backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

	List<Task> findByStatus(String status);

	@Query("SELECT t FROM Task t WHERE " +
			"LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
			"OR LOWER(COALESCE(t.description, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))")
	List<Task> searchByKeyword(@Param("keyword") String keyword);

	long countByStatus(String status);
}

