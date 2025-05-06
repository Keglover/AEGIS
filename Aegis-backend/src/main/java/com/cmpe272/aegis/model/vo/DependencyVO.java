package com.cmpe272.aegis.model.vo;

import com.cmpe272.aegis.constants.RiskLevel;
import lombok.Data;

@Data
public class DependencyVO {
    private Long id;
    private String packageName;
    private String currentVersion;
    private String latestVersion;
    private boolean outdated;
    private RiskLevel riskLevel;
    private int knownVulnerabilities;
}
