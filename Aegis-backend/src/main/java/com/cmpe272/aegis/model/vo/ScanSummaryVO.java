package com.cmpe272.aegis.model.vo;

import com.cmpe272.aegis.model.DependencyRiskInfo;
import lombok.Data;

import java.util.List;

@Data
public class ScanSummaryVO {
    private int totalDependencies;
    private int highRiskCount;
    private int outdatedCount;
    private int knownVulnerabilityCount;
    List<DependencyRiskInfo> highRiskDependencies;

}
