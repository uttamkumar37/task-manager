package backend.controller;

import backend.ApiIntegrationTest;
import backend.repository.TaskRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerApiIntegrationTest extends ApiIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private TaskRepository taskRepository;

    private String authToken;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        String username = "owner_" + System.nanoTime();
        register(username, "pass123");
        authToken = loginAndGetToken(username, "pass123");
    }

    @Test
    void createAndGetById_shouldReturnCreatedTask() throws Exception {
        long id = createTask("Learn Spring", "Task APIs", "PENDING");

        mockMvc.perform(get("/api/tasks/{id}", id).header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.title").value("Learn Spring"))
                .andExpect(jsonPath("$.status").value("TODO"))
                .andExpect(jsonPath("$.priority").value("MEDIUM"));
    }

    @Test
    void createWithPriorityAndDueDate_shouldReturnFields() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Deployment checklist",
                                  "description": "Prepare release notes",
                                  "status": "IN_PROGRESS",
                                  "priority": "URGENT",
                                  "dueDate": "2026-06-30"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Deployment checklist"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.priority").value("URGENT"))
                .andExpect(jsonPath("$.dueDate").value("2026-06-30"));
    }

    @Test
    void getAll_shouldReturnAllCreatedTasks() throws Exception {
        createTask("Task one", "D1", "PENDING");
        createTask("Task two", "D2", "DONE");

        mockMvc.perform(get("/api/tasks").header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void update_shouldModifyTaskFields() throws Exception {
        long id = createTask("Old title", "Old desc", "PENDING");

        mockMvc.perform(put("/api/tasks/{id}", id)
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "New title",
                                  "description": "New desc",
                                  "status": "IN_PROGRESS",
                                  "priority": "HIGH",
                                  "dueDate": "2026-07-01"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.title").value("New title"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.dueDate").value("2026-07-01"));
    }

    @Test
    void delete_shouldReturnNoContent() throws Exception {
        long id = createTask("Delete me", "To delete", "PENDING");

        mockMvc.perform(delete("/api/tasks/{id}", id).header("Authorization", "Bearer " + authToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/tasks/{id}", id).header("Authorization", "Bearer " + authToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void patchCompleteAndPending_shouldToggleStatus() throws Exception {
        long id = createTask("Toggle status", "Toggle status", "PENDING");

        mockMvc.perform(patch("/api/tasks/{id}/complete", id).header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        mockMvc.perform(patch("/api/tasks/{id}/pending", id).header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("TODO"));
    }

    @Test
    void search_shouldReturnTasksMatchingKeywordInTitleDescriptionStatusOrPriority() throws Exception {
        createTask("Learn Java", "Streams", "PENDING");
        createTask("Shopping list", "Buy milk and bread", "DONE", "HIGH", null);
        createTask("Workout plan", "Morning cardio", "IN_PROGRESS");

        mockMvc.perform(get("/api/tasks/search").header("Authorization", "Bearer " + authToken).param("keyword", "high"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Shopping list"));
    }

    @Test
    void getByStatus_shouldFilterTasksIncludingLegacyValues() throws Exception {
        createTask("Pending legacy", "Pending 1", "PENDING");
        createTask("Done legacy", "Done 1", "DONE");
        createTask("Todo modern", "Pending 2", "TODO");

        mockMvc.perform(get("/api/tasks").header("Authorization", "Bearer " + authToken).param("status", "TODO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].status").value("TODO"));
    }

    @Test
    void stats_shouldReturnModernAndLegacyCounts() throws Exception {
        createTask("Pending legacy", "Pending 1", "PENDING");
        createTask("In progress task", "Active", "IN_PROGRESS");
        createTask("Done legacy", "Done 1", "DONE");
        createTask("Blocked task", "Waiting", "BLOCKED");

        mockMvc.perform(get("/api/tasks/stats").header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(4))
                .andExpect(jsonPath("$.todo").value(1))
                .andExpect(jsonPath("$.inProgress").value(1))
                .andExpect(jsonPath("$.blocked").value(1))
                .andExpect(jsonPath("$.completed").value(1))
                .andExpect(jsonPath("$.pending").value(1))
                .andExpect(jsonPath("$.done").value(1));
    }

    @Test
    void invalidStatusFilter_shouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/tasks").header("Authorization", "Bearer " + authToken).param("status", "NOT_A_STATUS"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void invalidPriority_shouldReturnBadRequest() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Invalid priority","description":"Bad priority","status":"TODO","priority":"CRITICAL"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shortTitle_shouldReturnBadRequest() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"AB","description":"Too short","status":"TODO","priority":"MEDIUM"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void blankSearchKeyword_shouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/tasks/search").header("Authorization", "Bearer " + authToken).param("keyword", "   "))
                .andExpect(status().isBadRequest());
    }

    @Test
    void missingTask_shouldReturnNotFound() throws Exception {
        mockMvc.perform(get("/api/tasks/{id}", 9999L).header("Authorization", "Bearer " + authToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void userShouldNotAccessAnotherUsersTask() throws Exception {
        long ownerTaskId = createTask("Private task", "Only mine", "PENDING");

        String secondUsername = "other_" + System.nanoTime();
        register(secondUsername, "pass123");
        String secondToken = loginAndGetToken(secondUsername, "pass123");

        mockMvc.perform(get("/api/tasks/{id}", ownerTaskId).header("Authorization", "Bearer " + secondToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void unauthenticatedRequest_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isUnauthorized());
    }

    // Helpers

    private long createTask(String title, String description, String statusValue) throws Exception {
        return createTask(title, description, statusValue, null, null);
    }

    private long createTask(String title, String description, String statusValue, String priority, String dueDate) throws Exception {
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("title", title);
        payload.put("description", description);
        payload.put("status", statusValue);
        if (priority != null) {
            payload.put("priority", priority);
        }
        if (dueDate != null) {
            payload.put("dueDate", dueDate);
        }

        MvcResult result = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("id").asLong();
    }

    private String loginAndGetToken(String username, String password) {
        try {
            MvcResult result = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"username":"%s","password":"%s"}
                                    """.formatted(username, password)))
                    .andExpect(status().isOk())
                    .andReturn();

            JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
            return node.get("token").asText();
        } catch (Exception ex) {
            throw new RuntimeException("Unable to authenticate test user", ex);
        }
    }

    private void register(String username, String password) {
        try {
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"username":"%s","password":"%s"}
                                    """.formatted(username, password)))
                    .andExpect(status().isCreated());
        } catch (Exception ex) {
            throw new RuntimeException("Unable to register test user", ex);
        }
    }
}
