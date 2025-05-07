package com.cmpe272.aegis.model.vo;

import com.cmpe272.aegis.constants.ProjectStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProjectSummaryVO {
    private Long id;
    private String name;
    private ProjectStatus status;

    private LocalDateTime uploadTime;
    private ScanSummaryVO scanResult;
}
