package com.cmpe272.aegis.repository;


import com.cmpe272.aegis.constants.ProjectStatus;
import com.cmpe272.aegis.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStatus(ProjectStatus status);
    List<Project> findByUserId(Long userId);
}
