package com.cmpe272.aegis.model.form;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

/**
 * @author :37824
 * @description:TODO
 * @date :2025/05/05 5:30
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectForm {
    String name;
    MultipartFile file;
    String email;
}
