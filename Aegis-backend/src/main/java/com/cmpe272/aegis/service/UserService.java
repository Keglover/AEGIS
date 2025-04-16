package com.cmpe272.aegis.service;

import com.cmpe272.aegis.component.AESUtil;
import com.cmpe272.aegis.constants.ManagerErrorCode;
import com.cmpe272.aegis.constants.ResponseDTO;
import com.cmpe272.aegis.model.User;
import com.cmpe272.aegis.model.form.LoginForm;
import com.cmpe272.aegis.model.form.RegisterForm;
import com.cmpe272.aegis.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

/**
 * @author :37824
 * @description:TODO
 * @date :2025/04/16 15:39
 */
public class UserService {
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    UserRepository userRepository;
    public ResponseDTO<String> registerAccount(RegisterForm form){
        String password1 = form.getPassword1();
        String password2 = form.getPassword2();
        if(!password1.equals(password2)){
            return ResponseDTO.error(ManagerErrorCode.MANAGE_ACCOUNT_PWD2_ERROR);
        }else{
            User user = new User();
            user.setRole(form.getRole());
            user.setEmail(form.getEmail());
            user.setUsername(form.getUserName());
            user.setPassword(encoder.encode(form.getPassword1()));
            userRepository.save(user);
            return ResponseDTO.ok("User registered");
        }
    }

    public ResponseDTO<String> login(LoginForm form){
        Optional<User> tempUser = userRepository.findByEmail(form.getEmail());
        if(encoder.matches(form.getPassword(), tempUser.get().getPassword())){
            return ResponseDTO.ok();
        }else{
            return ResponseDTO.error(ManagerErrorCode.MANAGE_ACCOUNT_PWD_ERROR);
        }
    }
}
