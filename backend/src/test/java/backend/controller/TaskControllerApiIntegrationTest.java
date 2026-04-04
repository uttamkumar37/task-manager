package backend.controller;

import backend.repository.TaskRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TaskRepository taskRepository;

    private MockHttpSession authSession;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        String username = "owner_" + System.nanoTime();
        register(username, "pass123");
        authSession = login(username, "pass123");
    }

    @Test
    void createAndGetById_shouldReturnCreatedTask() throws Exception {
        long id = createTask("Learn Spring", "Task APIs", "PENDING");

        mockMvc.perform(get("/api/tasks/{id}", id).session(authSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.title").value("Learn Spring"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void getAll_shouldReturnAllCreatedTasks() throws Exception {
        createTask("T1", "D1", "PENDING");
        createTask("T2", "D2", "DONE");

        mockMvc.perform(get("/api/tasks").session(authSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void update_shouldModifyTaskFields() throws Exception {
        long id = createTask("Old title", "Old desc", "PENDING");

        String updateJson = """
                {
                  "title": "New title",
                  "description": "New desc",
                  "status": "DONE"
                }
                """;

        mockMvc.perform(put("/api/tasks/{id}", id)
                        .session(authSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.title").value("New title"))
                .andExpect(jsonPath("$.status").value("DONE"));
    }

    @Test
    void delete_shouldReturnNoContent() throws Exception {
        long id = createTask("Delete me", "To delete", "PENDING");

        mockMvc.perform(delete("/api/tasks/{id}", id).session(authSession))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/tasks/{id}", id).session(authSession))
                .andExpect(status().isNotFound());
    }

    @Test
    void patchCompleteAndPending_shouldToggleStatus() throws Exception {
        long id = createTask("Toggle", "Toggle status", "PENDING");

        mockMvc.perform(patch("/api/tasks/{id}/complete", id).session(authSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"));

        mockMvc.perform(patch("/api/tasks/{id}/pending", id).session(authSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void search_shouldReturnTasksMatchingKeywordInTitleOrDescription() throws Exception {
        createTask("Learn Java", "Streams", "PENDING");
        createTask("Shopping", "Buy milk and bread", "DONE");
        createTask("Workout", "Morning cardio", "PENDING");

        mockMvc.perform(get("/api/tasks/search").session(authSession).param("keyword", "milk"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Shopping"));
    }

    @Test
    void getByStatus_shouldFilterTasks() throws Exception {
        createTask("P1", "Pending 1", "PENDING");
        createTask("D1", "Done 1", "DONE");
        createTask("P2", "Pending 2", "PENDING");

        mockMvc.perform(get("/api/tasks").session(authSession).param("status", "PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void stats_shouldReturnTotalPendingAndDoneCounts() throws Exception {
        createTask("P1", "Pending 1", "PENDING");
        createTask("D1", "Done 1", "DONE");
        createTask("P2", "Pending 2", "PENDING");

        mockMvc.perform(get("/api/tasks/stats").session(authSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.pending").value(2))
                .andExpect(jsonPath("$.done").value(1));
    }

    @Test
    void invalidStatusFilter_shouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/tasks").session(authSession).param("status", "IN_PROGRESS"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void blankSearchKeyword_shouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/tasks/search").session(authSession).param("keyword", "   "))
                .andExpect(status().isBadRequest());
    }

    @Test
    void missingTask_shouldReturnNotFound() throws Exception {
        mockMvc.perform(get("/api/tasks/{id}", 9999L).session(authSession))
                .andExpect(status().isNotFound());
    }

    @Test
    void userShouldNotAccessAnotherUsersTask() throws Exception {
        long ownerTaskId = createTask("Private", "Only mine", "PENDING");

        String secondUsername = "other_" + System.nanoTime();
        register(secondUsername, "pass123");
        MockHttpSession secondSession = login(secondUsername, "pass123");

        mockMvc.perform(get("/api/tasks/{id}", ownerTaskId).session(secondSession))
                .andExpect(status().isNotFound());
    }

    @Test
    void unauthenticatedRequest_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isUnauthorized());
    }

    private long createTask(String title, String description, String statusValue) throws Exception {
        String requestJson = """
                {
                  "title": "%s",
                  "description": "%s",
                  "status": "%s"
                }
                """.formatted(title, description, statusValue);

        MvcResult result = mockMvc.perform(post("/api/tasks")
                        .session(authSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("id").asLong();
    }

    private MockHttpSession login(String username, String password) {
        String loginJson = """
                {
                  "username": "%s",
                  "password": "%s"
                }
                """.formatted(username, password);

        try {
            MvcResult result = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(loginJson))
                    .andExpect(status().isOk())
                    .andReturn();

            return (MockHttpSession) result.getRequest().getSession(false);
        } catch (Exception ex) {
            throw new RuntimeException("Unable to authenticate test session", ex);
        }
    }

    private void register(String username, String password) {
        String registerJson = """
                {
                  "username": "%s",
                  "password": "%s"
                }
                """.formatted(username, password);

        try {
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(registerJson))
                    .andExpect(status().isCreated());
        } catch (Exception ex) {
            throw new RuntimeException("Unable to register test user", ex);
        }
    }
}

