package backend.service;

import backend.dto.VisitorMessageRequestDTO;
import backend.dto.VisitorMessageResponseDTO;
import backend.model.PublicMessage;
import backend.model.PublicStats;
import backend.repository.PublicMessageRepository;
import backend.repository.PublicStatsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PublicEngagementService {

    private static final String VISITOR_COUNT_KEY = "visitor_count";
    private static final int NAME_MAX_LENGTH = 100;
    private static final int SOCIAL_HANDLE_MAX_LENGTH = 100;
    private static final int MESSAGE_MAX_LENGTH = 1000;

    private final PublicMessageRepository publicMessageRepository;
    private final PublicStatsRepository publicStatsRepository;

    public PublicEngagementService(
            PublicMessageRepository publicMessageRepository,
            PublicStatsRepository publicStatsRepository
    ) {
        this.publicMessageRepository = publicMessageRepository;
        this.publicStatsRepository = publicStatsRepository;
    }

    @Transactional(readOnly = true)
    public long getVisitorCount() {
        return publicStatsRepository.findByStatKey(VISITOR_COUNT_KEY)
                .map(PublicStats::getStatValue)
                .orElse(0L);
    }

    @Transactional
    public long registerVisitor() {
        PublicStats stats = publicStatsRepository.findByStatKeyForUpdate(VISITOR_COUNT_KEY)
                .orElseGet(() -> new PublicStats(VISITOR_COUNT_KEY, 0L));

        stats.setStatValue(stats.getStatValue() + 1);
        return publicStatsRepository.save(stats).getStatValue();
    }

    @Transactional
    public void saveMessage(VisitorMessageRequestDTO request, String submittedBy) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name and message are required");
        }

        String name = normalize(request.getName());
        String socialHandle = normalize(request.getSocialHandle());
        String message = normalize(request.getMessage());

        if (name.isBlank() || message.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name and message are required");
        }

        validateLength(name, NAME_MAX_LENGTH, "Name");
        validateLength(socialHandle, SOCIAL_HANDLE_MAX_LENGTH, "Social handle");
        validateLength(message, MESSAGE_MAX_LENGTH, "Message");

        publicMessageRepository.save(new PublicMessage(name, socialHandle, message, submittedBy));
    }

    /**
     * Admin gets all messages (newest first).
     * Regular user gets only messages they submitted (by username).
     */
    @Transactional(readOnly = true)
    public List<VisitorMessageResponseDTO> getMessages(String username, boolean isAdmin) {
        List<PublicMessage> messages = isAdmin
                ? publicMessageRepository.findTop500ByOrderByCreatedAtDesc()
                : publicMessageRepository.findTop500BySubmittedByOrderByCreatedAtDesc(username);

        return messages.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private void validateLength(String value, int maxLength, String fieldName) {
        if (value.length() > maxLength) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " must be " + maxLength + " characters or fewer");
        }
    }

    private VisitorMessageResponseDTO toDTO(PublicMessage message) {
        return new VisitorMessageResponseDTO(
                message.getName(),
                message.getSocialHandle(),
                message.getMessage(),
                message.getSubmittedBy()
        );
    }
}
