package backend.service;

import backend.dto.TaskDTO;
import backend.model.Task;
import backend.repository.TaskRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private static final List<String> VALID_STATUSES = List.of(
            "TODO",
            "IN_PROGRESS",
            "BLOCKED",
            "WAITING_REVIEW",
            "COMPLETED",
            "CANCELLED"
    );
    private static final List<String> VALID_PRIORITIES = List.of("LOW", "MEDIUM", "HIGH", "URGENT");
    private static final int TITLE_MIN_LENGTH = 3;
    private static final int TITLE_MAX_LENGTH = 200;
    private static final int DESCRIPTION_MAX_LENGTH = 2000;

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public TaskDTO createTask(TaskDTO taskDTO, String username) {
        Task task = new Task();
        task.setTitle(normalizeTitle(taskDTO.getTitle()));
        task.setDescription(normalizeDescription(taskDTO.getDescription()));
        task.setOwnerUsername(username);
        task.setStatus(normalizeStatus(taskDTO.getStatus()));
        task.setPriority(normalizePriority(taskDTO.getPriority()));
        task.setDueDate(taskDTO.getDueDate());

        Task savedTask = taskRepository.save(task);
        return toDTO(savedTask);
    }

    public List<TaskDTO> getAllTasks(String username) {
        return taskRepository.findByOwnerUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByStatus(String status, String username) {
        return taskRepository.findByOwnerUsernameAndStatusInOrderByCreatedAtDesc(username, statusStorageValues(status))
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public TaskDTO getTaskById(Long id, String username) {
        Task task = taskRepository.findByIdAndOwnerUsername(id, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found: " + id));
        return toDTO(task);
    }

    public TaskDTO updateTask(Long id, TaskDTO taskDTO, String username) {
        Task existingTask = taskRepository.findByIdAndOwnerUsername(id, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found: " + id));

        existingTask.setTitle(normalizeTitle(taskDTO.getTitle()));
        existingTask.setDescription(normalizeDescription(taskDTO.getDescription()));
        existingTask.setStatus(normalizeStatus(taskDTO.getStatus()));
        existingTask.setPriority(normalizePriority(taskDTO.getPriority()));
        existingTask.setDueDate(taskDTO.getDueDate());

        Task updatedTask = taskRepository.save(existingTask);
        return toDTO(updatedTask);
    }

    public void deleteTask(Long id, String username) {
        Task existingTask = taskRepository.findByIdAndOwnerUsername(id, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found: " + id));
        taskRepository.delete(existingTask);
    }

    public TaskDTO setTaskStatus(Long id, String status, String username) {
        Task existingTask = taskRepository.findByIdAndOwnerUsername(id, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found: " + id));

        existingTask.setStatus(normalizeStatus(status));
        Task updatedTask = taskRepository.save(existingTask);
        return toDTO(updatedTask);
    }

    public List<TaskDTO> searchTasks(String keyword, String username) {
        if (keyword == null || keyword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "keyword query parameter is required");
        }

        return taskRepository.searchByKeyword(username, keyword.trim())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Long> getTaskStats(String username) {
        Map<String, Long> stats = new LinkedHashMap<>();
        long todo = taskRepository.countByOwnerUsernameAndStatusIn(username, storageValuesForNormalizedStatus("TODO"));
        long completed = taskRepository.countByOwnerUsernameAndStatusIn(username, storageValuesForNormalizedStatus("COMPLETED"));
        stats.put("total", taskRepository.countByOwnerUsername(username));
        stats.put("todo", todo);
        stats.put("inProgress", taskRepository.countByOwnerUsernameAndStatus(username, "IN_PROGRESS"));
        stats.put("blocked", taskRepository.countByOwnerUsernameAndStatus(username, "BLOCKED"));
        stats.put("waitingReview", taskRepository.countByOwnerUsernameAndStatus(username, "WAITING_REVIEW"));
        stats.put("completed", completed);
        stats.put("cancelled", taskRepository.countByOwnerUsernameAndStatus(username, "CANCELLED"));
        stats.put("pending", todo);
        stats.put("done", completed);
        return stats;
    }

    private TaskDTO toDTO(Task task) {
        return new TaskDTO(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                normalizeStoredStatus(task.getStatus()),
                normalizeStoredPriority(task.getPriority()),
                task.getDueDate(),
                task.getCreatedAt()
        );
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }

        String normalizedStatus = normalizeToken(status);
        if ("PENDING".equals(normalizedStatus)) {
            return "TODO";
        }
        if ("DONE".equals(normalizedStatus)) {
            return "COMPLETED";
        }
        if ("TO_DO".equals(normalizedStatus)) {
            return "TODO";
        }
        if (!VALID_STATUSES.contains(normalizedStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be one of " + String.join(", ", VALID_STATUSES)
            );
        }

        return normalizedStatus;
    }

    private List<String> statusStorageValues(String status) {
        return storageValuesForNormalizedStatus(normalizeStatus(status));
    }

    private List<String> storageValuesForNormalizedStatus(String normalizedStatus) {
        if ("TODO".equals(normalizedStatus)) {
            return Arrays.asList("TODO", "PENDING");
        }
        if ("COMPLETED".equals(normalizedStatus)) {
            return Arrays.asList("COMPLETED", "DONE");
        }
        return Collections.singletonList(normalizedStatus);
    }

    private String normalizeStoredStatus(String status) {
        if (status == null || status.isBlank()) {
            return "TODO";
        }
        return normalizeStatus(status);
    }

    private String normalizePriority(String priority) {
        if (priority == null || priority.isBlank()) {
            return "MEDIUM";
        }

        String normalizedPriority = normalizeToken(priority);
        if (!VALID_PRIORITIES.contains(normalizedPriority)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Priority must be one of " + String.join(", ", VALID_PRIORITIES)
            );
        }

        return normalizedPriority;
    }

    private String normalizeStoredPriority(String priority) {
        if (priority == null || priority.isBlank()) {
            return "MEDIUM";
        }
        return normalizePriority(priority);
    }

    private String normalizeTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
        }

        String normalizedTitle = title.trim();
        if (normalizedTitle.length() < TITLE_MIN_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title must be at least 3 characters");
        }
        if (normalizedTitle.length() > TITLE_MAX_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title must be 200 characters or fewer");
        }

        return normalizedTitle;
    }

    private String normalizeDescription(String description) {
        String normalizedDescription = description == null ? "" : description.trim();
        if (normalizedDescription.length() > DESCRIPTION_MAX_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description must be 2000 characters or fewer");
        }
        return normalizedDescription;
    }

    private String normalizeToken(String value) {
        return value.trim().toUpperCase(Locale.ROOT).replace('-', '_').replace(' ', '_');
    }
}
