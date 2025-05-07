package com.cmpe272.aegis.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class HighRiskEmailReport {
    String dependencyName;
    String dependencyVersion;
    String cveUrl;
}
