package com.cmpe272.aegis.service;

import com.cmpe272.aegis.constants.ProjectStatus;
import com.cmpe272.aegis.constants.RiskLevel;
import com.cmpe272.aegis.model.*;
import com.cmpe272.aegis.model.vo.DependencyVO;
import com.cmpe272.aegis.model.vo.ProjectDetailVO;
import com.cmpe272.aegis.model.vo.ProjectSummaryVO;
import com.cmpe272.aegis.model.vo.ScanSummaryVO;
import com.cmpe272.aegis.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.*;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DependencyScanService {
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private ScannedDependencyRepository scannedDependencyRepository;
    @Autowired
    private DependencyScanResultRepository scanResultRepository;
    @Autowired
    private MailService mailService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${astra.token}")
    private String astraToken;

    @Value("${CRAWLER_URL}")
    private String CRAWLER_URL;
    private static final String ASTRA_LLM_URL = "https://api.langflow.astra.datastax.com/lf/3ba6c26d-8039-4a82-8001-8ac689b4f3d8/api/v1/run/187ef9ff-167d-4c24-8d4f-d07854528194?stream=false";

    public List<Project> queryProjectByUserId(Long id){
        return projectRepository.findByUserId(id);
    }

    public void updateProject(Project project){
        projectRepository.save(project);
    }

    @Transactional
    public Long createAndScanProject(String projectName, String fileName, String fileContent, String notifyEmail) throws MessagingException {
        Project project = new Project();
        project.setName(projectName);
        project.setFileName(fileName);
        project.setStatus(ProjectStatus.PENDING);
        project = projectRepository.save(project);

        scanDependencies(project, fileContent, notifyEmail);

        return project.getId();
    }

    private void scanDependencies(Project project, String fileContent, String notifyEmail) {
        try {
            project.setStatus(ProjectStatus.SCANNING);
            projectRepository.save(project);

            Map<String, String> depsWithVersions = extractDependenciesWithVersions(project.getFileName(), fileContent);
            List<String> namesOnly = new ArrayList<>(depsWithVersions.keySet());
            List<String> nameAndVersion = depsWithVersions.entrySet().stream()
                    .map(e -> e.getValue().isEmpty() ? e.getKey() : e.getKey() + "@" + e.getValue())
                    .collect(Collectors.toList());

            if (!sendToCrawlerService(namesOnly)) {
                throw new RuntimeException("Crawler service failed.");
            }

            List<ScannedDependency> enhancedDeps = queryAstraLLM(nameAndVersion, notifyEmail, project.getName());
            enhancedDeps.forEach(dep -> dep.setProject(project));
            scannedDependencyRepository.saveAll(enhancedDeps);

            DependencyScanResult result = summarizeResult(project, enhancedDeps);
            scanResultRepository.save(result);

            project.setStatus(ProjectStatus.COMPLETED);
            projectRepository.save(project);

        } catch (Exception e) {
            project.setStatus(ProjectStatus.FAILED);
            projectRepository.save(project);
            log.error("Scan failed for project: {}", project.getName(), e);
            throw new RuntimeException("Dependency scan failed", e);
        }
    }

    private Map<String, String> extractDependenciesWithVersions(String fileName, String fileContent) {
        if (fileName.toLowerCase().endsWith(".json")) {
            return extractFromPackageJsonWithVersion(fileContent);
        } else if (fileName.toLowerCase().endsWith(".xml")) {
            return extractFromPomXmlWithVersion(fileContent);
        }
        throw new IllegalArgumentException("Unsupported file type: " + fileName);
    }

    private Map<String, String> extractFromPackageJsonWithVersion(String fileContent) {
        JSONObject json = new JSONObject(fileContent);
        Map<String, String> deps = new HashMap<>();
        Optional.ofNullable(json.optJSONObject("dependencies"))
                .ifPresent(obj -> obj.keySet().forEach(k -> deps.put(k, obj.getString(k))));
        Optional.ofNullable(json.optJSONObject("devDependencies"))
                .ifPresent(obj -> obj.keySet().forEach(k -> deps.put(k, obj.getString(k))));
        return deps;
    }

    private Map<String, String> extractFromPomXmlWithVersion(String fileContent) {
        Map<String, String> deps = new HashMap<>();
        try {
            var builder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
            var doc = builder.parse(new InputSource(new StringReader(fileContent)));
            var nodes = doc.getElementsByTagName("dependency");

            for (int i = 0; i < nodes.getLength(); i++) {
                Element dep = (Element) nodes.item(i);
                String groupId = getText(dep, "groupId");
                String artifactId = getText(dep, "artifactId");
                String version = getText(dep, "version");
                if (groupId != null && artifactId != null) {
                    deps.put(groupId + ":" + artifactId, version != null ? version : "");
                }
            }
        } catch (Exception e) {
            log.error("Error parsing pom.xml", e);
        }
        return deps;
    }

    private boolean sendToCrawlerService(List<String> techs) {
        try {
            JSONObject body = new JSONObject();
            body.put("techs", techs);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> request = new HttpEntity<>(body.toString(), headers);
            ResponseEntity<Void> response = restTemplate.postForEntity(CRAWLER_URL, request, Void.class);

            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.error("Failed to call crawler service", e);
            return false;
        }
    }

    private List<ScannedDependency> queryAstraLLM(List<String> techs, String toEmail, String projectName) throws MessagingException {
        try {
            String prompt = """
            Given the following tech stack with versions: %s.

            For each item (package@version or groupId:artifactId@version), assess:
            - currentVersion (string)
            - latestVersion (string)
            - isOutdated (true/false)
            - knownVulnerabilities (int)
            - riskLevel ("LOW", "MEDIUM", "HIGH")
            - cveUrl (string)

            Return a pure JSON array of objects like:
            [
              {
                "packageName": "axios",
                "currentVersion": "0.19.0",
                "latestVersion": "1.4.0",
                "isOutdated": true,
                "riskLevel": "MEDIUM",
                "knownVulnerabilities": 2,
                "cveUrl": "https://nvd.nist.gov/vuln/detail/CVE-2021-12345"
              }
            ]
            Only output valid JSON.
            """.formatted(String.join(", ", techs));

            JSONObject payload = new JSONObject();
            payload.put("input_value", prompt);
            payload.put("output_type", "chat");
            payload.put("input_type", "chat");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(astraToken);

            HttpEntity<String> entity = new HttpEntity<>(payload.toString(), headers);
            ResponseEntity<String> response = restTemplate.exchange(ASTRA_LLM_URL, HttpMethod.POST, entity, String.class);

            String body = response.getBody();
            JsonNode root = objectMapper.readTree(body);

            // Navigate to the actual text response
            JsonNode textNode = root
                    .path("outputs").get(0)
                    .path("outputs").get(0)
                    .path("results")
                    .path("message")
                    .path("text");

            if (textNode.isMissingNode()) {
                throw new IllegalStateException("Failed to find LLM result text in response.");
            }

            String rawText = textNode.asText();

            // Remove surrounding ```json ... ```
            String cleanedJson = rawText
                    .replaceAll("(?s)^```json\\s*", "") // remove leading ```json
                    .replaceAll("\\s*```$", "");        // remove trailing ```

            List<ScannedDependency> result = objectMapper.readValue(cleanedJson, new TypeReference<>() {});
            List<HighRiskEmailReport> reportList = new ArrayList<>();
            for(ScannedDependency sd: result){
                if(sd.getRiskLevel().equals(RiskLevel.HIGH)){
                    HighRiskEmailReport report = new HighRiskEmailReport();
                    report.setDependencyName(sd.getPackageName());
                    report.setDependencyVersion(sd.getCurrentVersion());
                    report.setCveUrl(sd.getCveUrl());
                    reportList.add(report);
                }
            }
            mailService.sendHighRiskDependencyEmail(toEmail, projectName, reportList);
            return result;

        } catch (Exception e) {
            log.error("Failed to query Astra LLM", e);
            mailService.sendProjectFailureEmail(toEmail, projectName, e.getMessage());
            return List.of();
        }
    }

    private String getText(Element parent, String tag) {
        NodeList list = parent.getElementsByTagName(tag);
        return list.getLength() > 0 ? list.item(0).getTextContent() : null;
    }

    private DependencyScanResult summarizeResult(Project project, List<ScannedDependency> deps) {
        DependencyScanResult result = new DependencyScanResult();
        result.setProject(project);
        result.setTotalDependencies(deps.size());
        result.setHighRiskCount((int) deps.stream().filter(d -> d.getRiskLevel() == RiskLevel.HIGH).count());
        result.setOutdatedCount((int) deps.stream().filter(ScannedDependency::isOutdated).count());
        result.setKnownVulnerabilityCount(deps.stream().mapToInt(ScannedDependency::getKnownVulnerabilities).sum());
        result.setCreatedAt(LocalDateTime.now());
        return result;
    }

    public Optional<ProjectDetailVO> getProjectDetail(Long id) {
        Optional<Project> projectOpt = projectRepository.findById(id);
        if (projectOpt.isEmpty()) return Optional.empty();

        Project project = projectOpt.get();

        ProjectDetailVO vo = new ProjectDetailVO();
        vo.setId(project.getId());
        vo.setName(project.getName());
        vo.setFileName(project.getFileName());
        vo.setStatus(project.getStatus());
        vo.setUploadTime(project.getUploadTime());

        DependencyScanResult result = project.getScanResult();
        if (result != null) {
            ScanSummaryVO scan = new ScanSummaryVO();
            scan.setTotalDependencies(result.getTotalDependencies());
            scan.setHighRiskCount(result.getHighRiskCount());
            scan.setOutdatedCount(result.getOutdatedCount());
            scan.setKnownVulnerabilityCount(result.getKnownVulnerabilityCount());
            vo.setScanResult(scan);
        }

        List<DependencyVO> depVOs = scannedDependencyRepository.findByProjectId(project.getId())
                .stream()
                .map(d -> {
                    DependencyVO dep = new DependencyVO();
                    dep.setId(d.getId());
                    dep.setPackageName(d.getPackageName());
                    dep.setCurrentVersion(d.getCurrentVersion());
                    dep.setLatestVersion(d.getLatestVersion());
                    dep.setOutdated(d.isOutdated());
                    dep.setRiskLevel(d.getRiskLevel());
                    dep.setCveUrl(d.getCveUrl());
                    dep.setKnownVulnerabilities(d.getKnownVulnerabilities());
                    return dep;
                }).toList();

        vo.setDependencies(depVOs);
        return Optional.of(vo);
    }

    public List<ProjectSummaryVO> getAllProjectSummaries() {
        return projectRepository.findAll(Sort.by(Sort.Direction.DESC, "uploadTime"))
                .stream()
                .map(project -> {
                    ProjectSummaryVO vo = new ProjectSummaryVO();
                    vo.setId(project.getId());
                    vo.setName(project.getName());
                    vo.setStatus(project.getStatus());
                    vo.setUploadTime(project.getUploadTime());

                    DependencyScanResult result = project.getScanResult();
                    if (result != null) {
                        ScanSummaryVO scan = new ScanSummaryVO();
                        scan.setTotalDependencies(result.getTotalDependencies());
                        scan.setHighRiskCount(result.getHighRiskCount());
                        scan.setOutdatedCount(result.getOutdatedCount());
                        scan.setKnownVulnerabilityCount(result.getKnownVulnerabilityCount());
                        vo.setScanResult(scan);
                    }

                    return vo;
                })
                .toList();
    }
}
