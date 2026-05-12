package com.taskmanager.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.TODO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.MEDIUM;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    private LocalDateTime dueDate;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public enum Status {
        TODO, IN_PROGRESS, REVIEW, DONE
    }

    public enum Priority {
        LOW, MEDIUM, HIGH
    }
}
