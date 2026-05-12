package com.taskmanager.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.MEMBER;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public enum Role {
        ADMIN, MANAGER, MEMBER
    }
}
