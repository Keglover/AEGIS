package com.cmpe272.aegis.model;

import com.cmpe272.aegis.constants.RiskLevel;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Entity
@Data
@Table(name = "t_scanned_dependency")
public class ScannedDependency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String packageName;

    private String currentVersion;

    private String latestVersion;

    @JsonProperty("isOutdated")
    private boolean isOutdated;

    @Column
    private String cveUrl;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    private int knownVulnerabilities;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
}
