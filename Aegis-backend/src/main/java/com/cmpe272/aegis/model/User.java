package com.cmpe272.aegis.model;

import com.cmpe272.aegis.constants.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author :37824
 * @description:TODO
 * @date :2025/04/16 14:55
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {

    private Long id;
    private boolean deleted;
    private String username;
    private String email;
    private String password;
    private UserRole role;
}

