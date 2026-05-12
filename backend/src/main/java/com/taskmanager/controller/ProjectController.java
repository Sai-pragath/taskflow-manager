package com.taskmanager.controller;

import com.taskmanager.dto.ProjectRequest;
import com.taskmanager.entity.Project;
import com.taskmanager.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<Project>> getAll(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(projectService.getAllForUser(user.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getById(@PathVariable String id) {
        return ResponseEntity.ok(projectService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Project> create(@Valid @RequestBody ProjectRequest request,
                                           @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(projectService.create(request, user.getUsername()));
    }

    @PostMapping("/{id}/members/{userId}")
    public ResponseEntity<Project> addMember(@PathVariable String id,
                                              @PathVariable String userId) {
        return ResponseEntity.ok(projectService.addMember(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        projectService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Project deleted"));
    }
}
