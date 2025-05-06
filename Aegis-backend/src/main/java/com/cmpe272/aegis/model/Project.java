package com.cmpe272.aegis.model;

import com.cmpe272.aegis.constants.ProjectStatus;
import com.cmpe272.aegis.model.ScannedDependency;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "t_project")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    @Column(name = "upload_time", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime uploadTime = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private ProjectStatus status = ProjectStatus.PENDING;

    private String fileName;

    private Long userId;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ScannedDependency> dependencies;

    @OneToOne(mappedBy = "project", cascade = CascadeType.ALL)
    private DependencyScanResult scanResult;
}
