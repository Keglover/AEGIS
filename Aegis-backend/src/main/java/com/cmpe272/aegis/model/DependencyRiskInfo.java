package com.cmpe272.aegis.model;

import lombok.Data;

/**
 * @author :37824
 * @description:TODO
 * @date :2025/05/06 22:21
 */
@Data
public class DependencyRiskInfo {
    private String packageName;
    private String version;
    private String cveUrl;
}

