package backend.controller;

import backend.dto.TaskDTO;
import backend.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@RequestBody TaskDTO taskDTO, Authentication authentication) {
        TaskDTO createdTask = taskService.createTask(taskDTO, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }

    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAllTasks(
            @RequestParam(value = "status", required = false) String status,
            Authentication authentication
    ) {
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(taskService.getTasksByStatus(status, authentication.getName()));
        }
        return ResponseEntity.ok(taskService.getAllTasks(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(taskService.getTaskById(id, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Long id, @RequestBody TaskDTO taskDTO, Authentication authentication) {
        TaskDTO updatedTask = taskService.updateTask(id, taskDTO, authentication.getName());
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, Authentication authentication) {
        taskService.deleteTask(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<TaskDTO> markTaskComplete(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(taskService.setTaskStatus(id, "DONE", authentication.getName()));
    }

    @PatchMapping("/{id}/pending")
    public ResponseEntity<TaskDTO> markTaskPending(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(taskService.setTaskStatus(id, "PENDING", authentication.getName()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<TaskDTO>> searchTasks(@RequestParam("keyword") String keyword, Authentication authentication) {
        return ResponseEntity.ok(taskService.searchTasks(keyword, authentication.getName()));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getTaskStats(Authentication authentication) {
        return ResponseEntity.ok(taskService.getTaskStats(authentication.getName()));
    }
}

