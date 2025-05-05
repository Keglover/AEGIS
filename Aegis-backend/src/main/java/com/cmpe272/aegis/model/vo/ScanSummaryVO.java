package com.cmpe272.aegis.model.vo;

import lombok.Data;

@Data
public class ScanSummaryVO {
    private int totalDependencies;
    private int highRiskCount;
    private int outdatedCount;
    private int knownVulnerabilityCount;
}
