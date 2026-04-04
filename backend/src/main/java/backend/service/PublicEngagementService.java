package backend.service;

import backend.dto.VisitorMessageRequestDTO;
import backend.dto.VisitorMessageResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class PublicEngagementService {

    private final AtomicLong visitorCount = new AtomicLong(0);
    private final List<StoredMessage> messages = new ArrayList<>();

    public long getVisitorCount() {
        return visitorCount.get();
    }

    public long registerVisitor() {
        return visitorCount.incrementAndGet();
    }

    public void saveMessage(VisitorMessageRequestDTO request, String submittedBy) {
        String name = normalize(request.getName());
        String socialHandle = normalize(request.getSocialHandle());
        String message = normalize(request.getMessage());

        if (name.isBlank() || message.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name and message are required");
        }

        synchronized (messages) {
            messages.add(new StoredMessage(name, socialHandle, message, submittedBy));

            // Keep memory usage bounded for this simple in-memory store.
            if (messages.size() > 500) {
                messages.remove(0);
            }
        }
    }

    /**
     * Admin gets all messages (newest first).
     * Regular user gets only messages they submitted (by username).
     */
    public List<VisitorMessageResponseDTO> getMessages(String username, boolean isAdmin) {
        synchronized (messages) {
            List<VisitorMessageResponseDTO> result = new ArrayList<>();
            for (StoredMessage m : messages) {
                if (isAdmin || username.equals(m.submittedBy())) {
                    result.add(new VisitorMessageResponseDTO(m.name(), m.socialHandle(), m.message(), m.submittedBy()));
                }
            }
            Collections.reverse(result);
            return result;
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private record StoredMessage(String name, String socialHandle, String message, String submittedBy) {
    }
}
