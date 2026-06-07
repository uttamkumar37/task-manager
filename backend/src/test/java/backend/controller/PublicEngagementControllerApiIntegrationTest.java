package backend.controller;

import backend.ApiIntegrationTest;
import backend.repository.PublicMessageRepository;
import backend.repository.PublicStatsRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PublicEngagementControllerApiIntegrationTest extends ApiIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private PublicMessageRepository publicMessageRepository;
    @Autowired private PublicStatsRepository publicStatsRepository;

    @BeforeEach
    void setUp() {
        publicMessageRepository.deleteAll();
        publicStatsRepository.deleteAll();
    }

    @Test
    void visitorCounter_shouldPersistCount() throws Exception {
        mockMvc.perform(get("/api/public/visitors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(0));

        mockMvc.perform(post("/api/public/visitors/register"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));

        mockMvc.perform(post("/api/public/visitors/register"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(2));

        mockMvc.perform(get("/api/public/visitors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(2));
    }

    @Test
    void publicMessage_shouldAllowAnonymousPostAndAdminRead() throws Exception {
        mockMvc.perform(post("/api/public/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Alice","socialHandle":"@alice","message":"Hello"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Message received. Thanks for reaching out!"));

        String adminToken = loginAndGetToken("admin", "admin123");

        mockMvc.perform(get("/api/messages").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Alice"))
                .andExpect(jsonPath("$[0].socialHandle").value("@alice"))
                .andExpect(jsonPath("$[0].message").value("Hello"));
    }

    @Test
    void authenticatedUser_shouldReadOwnSubmittedMessages() throws Exception {
        String username = "message_user_" + System.nanoTime();
        registerUser(username, "pass123");
        String token = loginAndGetToken(username, "pass123");

        mockMvc.perform(post("/api/public/messages")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Owner","socialHandle":"","message":"This is mine"}
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/messages").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Owner"))
                .andExpect(jsonPath("$[0].message").value("This is mine"))
                .andExpect(jsonPath("$[0].submittedBy").value(username));
    }

    @Test
    void publicMessage_withTooLongMessage_shouldReturnBadRequest() throws Exception {
        String longMessage = "x".repeat(1001);

        mockMvc.perform(post("/api/public/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Alice","socialHandle":"@alice","message":"%s"}
                                """.formatted(longMessage)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unauthenticatedUser_shouldNotReadMessages() throws Exception {
        mockMvc.perform(get("/api/messages"))
                .andExpect(status().isUnauthorized());
    }

    private String loginAndGetToken(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"%s","password":"%s"}
                                """.formatted(username, password)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("token").asText();
    }

    private void registerUser(String username, String password) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"%s","password":"%s"}
                                """.formatted(username, password)))
                .andExpect(status().isCreated());
    }
}
