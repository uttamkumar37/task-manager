package backend.service;

import backend.dto.TaskDTO;
import backend.model.Task;
import backend.repository.TaskRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public TaskDTO createTask(TaskDTO taskDTO) {
        Task task = new Task();
        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setStatus(normalizeStatus(taskDTO.getStatus()));

        Task savedTask = taskRepository.save(task);
        return toDTO(savedTask);
    }

    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByStatus(String status) {
        return taskRepository.findByStatus(normalizeStatus(status))
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public TaskDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found: " + id));
        return toDTO(task);
    }

    public TaskDTO updateTask(Long id, TaskDTO taskDTO) {
        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found: " + id));

        existingTask.setTitle(taskDTO.getTitle());
        existingTask.setDescription(taskDTO.getDescription());
        existingTask.setStatus(normalizeStatus(taskDTO.getStatus()));

        Task updatedTask = taskRepository.save(existingTask);
        return toDTO(updatedTask);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found: " + id);
        }
        taskRepository.deleteById(id);
    }

    public TaskDTO setTaskStatus(Long id, String status) {
        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found: " + id));

        existingTask.setStatus(normalizeStatus(status));
        Task updatedTask = taskRepository.save(existingTask);
        return toDTO(updatedTask);
    }

    public List<TaskDTO> searchTasks(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "keyword query parameter is required");
        }

        return taskRepository.searchByKeyword(keyword.trim())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Long> getTaskStats() {
        Map<String, Long> stats = new LinkedHashMap<>();
        long pending = taskRepository.countByStatus("PENDING");
        long done = taskRepository.countByStatus("DONE");
        stats.put("total", taskRepository.count());
        stats.put("pending", pending);
        stats.put("done", done);
        return stats;
    }

    private TaskDTO toDTO(Task task) {
        return new TaskDTO(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getCreatedAt()
        );
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required (PENDING or DONE)");
        }

        String normalizedStatus = status.trim().toUpperCase(Locale.ROOT);
        if (!"PENDING".equals(normalizedStatus) && !"DONE".equals(normalizedStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be PENDING or DONE");
        }

        return normalizedStatus;
    }
}

