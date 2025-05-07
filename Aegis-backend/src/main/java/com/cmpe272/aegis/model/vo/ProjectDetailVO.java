package com.cmpe272.aegis.model.vo;

import com.cmpe272.aegis.constants.ProjectStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProjectDetailVO {
    private Long id;
    private String name;
    private String fileName;
    private ProjectStatus status;
    private LocalDateTime uploadTime;
    private ScanSummaryVO scanResult;
    private List<DependencyVO> dependencies;
}