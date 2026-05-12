package com.taskmanager.repository;

import com.taskmanager.entity.Task;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {

    @EntityGraph(attributePaths = {"assignee"})
    List<Task> findByProjectId(String projectId);

    @EntityGraph(attributePaths = {"assignee"})
    List<Task> findByAssigneeId(String assigneeId);

    @EntityGraph(attributePaths = {"assignee"})
    List<Task> findByProjectIdAndStatus(String projectId, Task.Status status);

    long countByProjectIdAndStatus(String projectId, Task.Status status);
}
