package backend.repository;

import backend.model.PublicMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PublicMessageRepository extends JpaRepository<PublicMessage, Long> {

    List<PublicMessage> findTop500ByOrderByCreatedAtDesc();

    List<PublicMessage> findTop500BySubmittedByOrderByCreatedAtDesc(String submittedBy);
}
