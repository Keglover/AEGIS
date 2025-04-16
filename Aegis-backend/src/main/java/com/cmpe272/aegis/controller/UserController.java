package com.cmpe272.aegis.controller;

import com.cmpe272.aegis.constants.ResponseDTO;
import com.cmpe272.aegis.model.form.LoginForm;
import com.cmpe272.aegis.model.form.RegisterForm;
import com.cmpe272.aegis.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author :37824
 * @description:TODO
 * @date :2025/04/16 14:54
 */
@RestController
@Slf4j
@RequestMapping("/auth")
public class UserController {
    UserService userService;

    @PostMapping("/register")
    public ResponseDTO<String> registerUser(RegisterForm form){
        return userService.registerAccount(form);
    }

    @PostMapping("/login")
    public ResponseDTO<String> loginUser(LoginForm form){
        return userService.login(form);
    }
}
