package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String status;

    private String priority;

    @NotBlank(message = "Project ID is required")
    private String projectId;

    private String assigneeId;

    private String dueDate;
}
