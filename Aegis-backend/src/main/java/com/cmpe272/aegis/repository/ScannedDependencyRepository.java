package com.cmpe272.aegis.repository;
import com.cmpe272.aegis.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScannedDependencyRepository extends JpaRepository<ScannedDependency, Long> {
    List<ScannedDependency> findByProject(Project project);
    List<ScannedDependency> findByProjectId(Long projectId);
}
