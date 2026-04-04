package backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerApiIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Test
    void register_shouldCreateAccount() throws Exception {
        String username = "user_" + System.nanoTime();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"%s","password":"pass123"}
                                """.formatted(username)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Registration successful"))
                .andExpect(jsonPath("$.username").value(username))
                .andExpect(jsonPath("$.role").value("ROLE_USER"));
    }

    @Test
    void login_shouldReturnJwtToken() throws Exception {
        String username = "user_" + System.nanoTime();
        registerUser(username, "pass123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"%s","password":"pass123"}
                                """.formatted(username)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.username").value(username))
                .andExpect(jsonPath("$.role").value("ROLE_USER"))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        String token = extractToken(result);

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username));
    }

    @Test
    void login_withWrongPassword_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"admin","password":"wrong-password"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void logout_shouldReturnSuccess() throws Exception {
        String username = "user_" + System.nanoTime();
        registerUser(username, "pass123");
        String token = loginAndGetToken(username, "pass123");

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logout successful"));

        // Without a valid token, /api/tasks should be 401
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isUnauthorized());
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    String loginAndGetToken(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"%s","password":"%s"}
                                """.formatted(username, password)))
                .andExpect(status().isOk())
                .andReturn();
        return extractToken(result);
    }

    private String extractToken(MvcResult result) throws Exception {
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
