package com.cmpe272.aegis.controller;

import com.cmpe272.aegis.constants.HTTPCode;
import com.cmpe272.aegis.constants.ResponseDTO;
import com.cmpe272.aegis.model.Project;
import com.cmpe272.aegis.model.form.ProjectForm;
import com.cmpe272.aegis.model.vo.ProjectDetailVO;
import com.cmpe272.aegis.model.vo.ProjectSummaryVO;
import com.cmpe272.aegis.service.DependencyScanService;

import com.cmpe272.aegis.service.MailService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/project")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectController {

    @Autowired
    DependencyScanService dependencyScanService;
    @Autowired
    MailService mailService;

    @PostMapping("/upload")
    public ResponseDTO<Long> uploadProject(
            @RequestParam("name") String projectName, @RequestParam("file") MultipartFile file, @RequestParam("email") String email
            ) {
        log.info("Start upload file");
        try {
            String content = new String(file.getBytes());
            Long projectId = dependencyScanService.createAndScanProject(projectName, file.getOriginalFilename(), content);
            LocalDateTime completedTime = LocalDateTime.now();
            mailService.sendProjectCompletionEmail(email, projectName, completedTime);
            return ResponseDTO.ok("Project created and scan started.", projectId);
        } catch (Exception e) {
            log.error("Project upload or scan failed", e);
            return ResponseDTO.fail(HTTPCode.INTERNAL_ERROR, "Upload or scan failed.");
        }
    }

    @GetMapping("/{id}")
    public ResponseDTO<ProjectDetailVO> getProjectDetail(@PathVariable Long id) {
        return dependencyScanService.getProjectDetail(id)
                .map(ResponseDTO::ok)
                .orElseGet(() -> ResponseDTO.fail(HTTPCode.NOT_FOUND, "Project not found"));
    }

    @GetMapping("/list")
    public ResponseDTO<List<ProjectSummaryVO>> listAllProjects() {
        return ResponseDTO.ok(dependencyScanService.getAllProjectSummaries());
    }



    @GetMapping("/edit")
    public ResponseDTO<String> editProject(@RequestBody Project project){
        dependencyScanService.updateProject(project);
        return ResponseDTO.ok();
    }
}
