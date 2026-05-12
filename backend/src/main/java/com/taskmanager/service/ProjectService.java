package com.taskmanager.service;

import com.taskmanager.dto.ProjectRequest;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<Project> getAllForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return projectRepository.findAllAccessibleByUser(user.getId());
    }

    public Project getById(String id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    @Transactional
    public Project create(ProjectRequest request, String userEmail) {
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setOwner(owner);
        project.getMembers().add(owner);

        return projectRepository.save(project);
    }

    @Transactional
    public Project addMember(String projectId, String userId) {
        Project project = getById(projectId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!project.getMembers().contains(user)) {
            project.getMembers().add(user);
        }

        return projectRepository.save(project);
    }

    public void delete(String projectId) {
        projectRepository.deleteById(projectId);
    }
}
