package com.cmpe272.aegis.controller;

import com.cmpe272.aegis.constants.ResponseDTO;
import com.cmpe272.aegis.model.form.LoginForm;
import com.cmpe272.aegis.model.form.RegisterForm;
import com.cmpe272.aegis.model.form.Verify2FAForm;
import com.cmpe272.aegis.service.UserService;
import jakarta.mail.MessagingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * @author :37824
 * @description:TODO
 * @date :2025/04/16 14:54
 */
@RestController
@Slf4j
@RequestMapping("/auth")
public class UserController {
    @Autowired
    UserService userService;

    @PostMapping("/register")
    public ResponseDTO<String> registerUser(@RequestBody RegisterForm form){
        return userService.registerAccount(form);
    }

    @PostMapping("/login")
    public ResponseDTO<String> loginUser(@RequestBody LoginForm form){
        return userService.login(form);
    }

    @PostMapping("/send_verify_email")
    public ResponseDTO<String> sendVerifyEmail(@RequestBody Map<String, String> map) throws MessagingException {
        return userService.sendEmailVerifyCode(map.get("email"));
    }

    @PostMapping("/verify_email")
    public ResponseDTO<String> verifyEmail(@RequestBody Map<String, String> map){
        return userService.verifyEmail(map.get("email"), map.get("code"));
    }


    @PostMapping("/generate_2FA")
    public ResponseDTO<String> generate2FA(@RequestBody Map<String, String> map){
        return userService.generateUser2FACode(map.get("email"));
    }
    @PostMapping("/verify_2FA")
    public ResponseDTO<Map<String, Long>> verify2FA(@RequestBody Verify2FAForm form){
        return userService.verify2FACode(form.getEmail(), form.getCode());
    }


}
