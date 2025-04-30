package com.cmpe272.aegis.model.form;

import lombok.Data;

/**
 * @author :37824
 * @description:TODO
 * @date :2025/04/30 15:34
 */
@Data
public class Verify2FAForm {
    String email;
    String code;
}
