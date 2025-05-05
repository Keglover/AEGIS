package com.cmpe272.aegis.repository;
import com.cmpe272.aegis.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DependencyScanResultRepository extends JpaRepository<DependencyScanResult, Long> {
    Optional<DependencyScanResult> findByProject(Project project);
}