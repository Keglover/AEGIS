package com.cmpe272.aegis.model.form;

import com.cmpe272.aegis.constants.UserRole;
import lombok.Data;

/**
 * @author :37824
 * @description:TODO
 * @date :2025/04/16 15:55
 */
@Data
public class RegisterForm {
    String email;
    String userName;
    String password1;
    String password2;
    UserRole role;
}
