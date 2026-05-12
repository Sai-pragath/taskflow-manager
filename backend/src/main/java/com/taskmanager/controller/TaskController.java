package com.taskmanager.controller;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.entity.Task;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getByProject(@PathVariable String projectId) {
        return ResponseEntity.ok(taskService.getByProject(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getById(@PathVariable String id) {
        return ResponseEntity.ok(taskService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Task> create(@Valid @RequestBody TaskRequest request,
                                        @AuthenticationPrincipal UserDetails user) {
        Task task = taskService.create(request, user.getUsername());
        // Broadcast to all clients subscribed to this project's task topic
        messagingTemplate.convertAndSend("/topic/tasks/" + request.getProjectId(), task);
        return ResponseEntity.ok(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> update(@PathVariable String id,
                                        @Valid @RequestBody TaskRequest request) {
        Task task = taskService.update(id, request);
        messagingTemplate.convertAndSend("/topic/tasks/" + task.getProject().getId(), task);
        return ResponseEntity.ok(task);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Task> updateStatus(@PathVariable String id,
                                              @RequestBody Map<String, String> body) {
        Task task = taskService.updateStatus(id, body.get("status"));
        messagingTemplate.convertAndSend("/topic/tasks/" + task.getProject().getId(), task);
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        taskService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Task deleted"));
    }

    @GetMapping("/project/{projectId}/analytics/status")
    public ResponseEntity<Map<String, Long>> getStatusCounts(@PathVariable String projectId) {
        return ResponseEntity.ok(taskService.getStatusCounts(projectId));
    }

    @GetMapping("/project/{projectId}/analytics/priority")
    public ResponseEntity<Map<String, Long>> getPriorityCounts(@PathVariable String projectId) {
        return ResponseEntity.ok(taskService.getPriorityCounts(projectId));
    }
}
