package com.taskmanager.repository;

import com.taskmanager.entity.Project;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {

    List<Project> findByOwnerId(String ownerId);

    @Query("SELECT p FROM Project p JOIN p.members m WHERE m.id = :userId")
    List<Project> findByMemberId(String userId);

    @EntityGraph(attributePaths = {"owner", "members"})
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members m WHERE p.owner.id = :userId OR m.id = :userId")
    List<Project> findAllAccessibleByUser(String userId);

    @EntityGraph(attributePaths = {"owner", "members"})
    Optional<Project> findById(String id);
}
