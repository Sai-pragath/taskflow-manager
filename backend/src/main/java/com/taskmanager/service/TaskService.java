package com.taskmanager.service;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<Task> getByProject(String projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    public List<Task> getByAssignee(String assigneeId) {
        return taskRepository.findByAssigneeId(assigneeId);
    }

    public Task getById(String id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    @Transactional
    public Task create(TaskRequest request, String userEmail) {
        if (request.getProjectId() == null || request.getProjectId().trim().isEmpty()) {
            throw new RuntimeException("Project ID is required");
        }
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setProject(project);

        if (request.getPriority() != null) {
            task.setPriority(Task.Priority.valueOf(request.getPriority()));
        }

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignee(assignee);
        }

        if (request.getDueDate() != null) {
            task.setDueDate(LocalDateTime.parse(request.getDueDate()));
        }

        return taskRepository.save(task);
    }

    @Transactional
    public Task updateStatus(String taskId, String status) {
        Task task = getById(taskId);
        task.setStatus(Task.Status.valueOf(status));
        return taskRepository.save(task);
    }

    @Transactional
    public Task update(String taskId, TaskRequest request) {
        Task task = getById(taskId);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());

        if (request.getPriority() != null) {
            task.setPriority(Task.Priority.valueOf(request.getPriority()));
        }
        if (request.getStatus() != null) {
            task.setStatus(Task.Status.valueOf(request.getStatus()));
        }
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignee(assignee);
        }
        if (request.getDueDate() != null) {
            task.setDueDate(LocalDateTime.parse(request.getDueDate()));
        }

        return taskRepository.save(task);
    }

    public void delete(String taskId) {
        taskRepository.deleteById(taskId);
    }

    /**
     * Returns task counts grouped by status for a project — used for analytics.
     */
    public Map<String, Long> getStatusCounts(String projectId) {
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        return tasks.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getStatus().name(),
                        Collectors.counting()));
    }

    /**
     * Returns task counts grouped by priority for a project — used for analytics.
     */
    public Map<String, Long> getPriorityCounts(String projectId) {
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        return tasks.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getPriority().name(),
                        Collectors.counting()));
    }
}
