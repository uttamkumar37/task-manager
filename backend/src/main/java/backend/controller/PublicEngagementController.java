package backend.controller;

import backend.dto.AuthResponseDTO;
import backend.dto.VisitorCountResponseDTO;
import backend.dto.VisitorMessageRequestDTO;
import backend.dto.VisitorMessageResponseDTO;
import backend.service.PublicEngagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PublicEngagementController {

    private final PublicEngagementService publicEngagementService;

    public PublicEngagementController(PublicEngagementService publicEngagementService) {
        this.publicEngagementService = publicEngagementService;
    }

    @GetMapping("/api/public/visitors")
    public ResponseEntity<VisitorCountResponseDTO> getVisitorCount() {
        return ResponseEntity.ok(new VisitorCountResponseDTO(publicEngagementService.getVisitorCount()));
    }

    @PostMapping("/api/public/visitors/register")
    public ResponseEntity<VisitorCountResponseDTO> registerVisitor() {
        long count = publicEngagementService.registerVisitor();
        return ResponseEntity.ok(new VisitorCountResponseDTO(count));
    }

    /** Public — anyone can post. Captures username if the poster is logged in. */
    @PostMapping("/api/public/messages")
    public ResponseEntity<AuthResponseDTO> leaveMessage(
            @RequestBody VisitorMessageRequestDTO request,
            Authentication authentication
    ) {
        String submittedBy = (authentication != null && authentication.isAuthenticated()) ? authentication.getName() : null;
        publicEngagementService.saveMessage(request, submittedBy);
        return ResponseEntity.ok(new AuthResponseDTO("Message received. Thanks for reaching out!", null, null));
    }

    /** Authenticated — admin sees all, regular user sees only their own. */
    @GetMapping("/api/messages")
    public ResponseEntity<List<VisitorMessageResponseDTO>> getMessages(Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(publicEngagementService.getMessages(authentication.getName(), isAdmin));
    }
}
