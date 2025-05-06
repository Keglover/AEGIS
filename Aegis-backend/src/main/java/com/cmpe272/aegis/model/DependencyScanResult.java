package com.cmpe272.aegis.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "t_dependency_scan_result")
public class DependencyScanResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    private int totalDependencies;

    private int highRiskCount;

    private int outdatedCount;

    private int knownVulnerabilityCount;

    private LocalDateTime createdAt = LocalDateTime.now();
}

