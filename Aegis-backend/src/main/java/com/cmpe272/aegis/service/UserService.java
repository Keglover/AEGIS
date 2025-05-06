package com.cmpe272.aegis.service;

import com.cmpe272.aegis.component.AESUtil;
import com.cmpe272.aegis.constants.HTTPCode;
import com.cmpe272.aegis.constants.ManagerErrorCode;
import com.cmpe272.aegis.constants.ResponseDTO;
import com.cmpe272.aegis.constants.UserRole;
import com.cmpe272.aegis.model.User;
import com.cmpe272.aegis.model.form.LoginForm;
import com.cmpe272.aegis.model.form.RegisterForm;
import com.cmpe272.aegis.repository.UserRepository;
import jakarta.mail.MessagingException;
import org.apache.http.client.protocol.ResponseProcessCookies;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * @author :37824
 * @description:TODO
 * @date :2025/04/16 15:39
 */
@Service
public class UserService {
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    @Autowired
    UserRepository userRepository;
    @Autowired
    TwoFactorService twoFactorService;

    @Autowired
    MailService mailService;

    @Autowired
    VerificationCodeService verificationCodeService;

    @Autowired
    AESUtil aesUtil;

    public ResponseDTO<String> registerAccount(RegisterForm form){
        String password1 = form.getPassword1();
        String password2 = form.getPassword2();
        if(!password1.equals(password2)){
            return ResponseDTO.error(HTTPCode.BAD_REQUEST);
        }else{
            User user = new User();
            user.setRole(form.getRole());
            user.setEmail(form.getEmail());
            user.setUsername(form.getUserName());
            user.setPassword(encoder.encode(form.getPassword1()));
            user.setTwoFactorEnabled(false);
            user.setTwoFactorSecret(null);
            user.setRole(UserRole.USER);
            userRepository.save(user);
            return ResponseDTO.ok("User registered");
        }
    }

    public ResponseDTO<String> login(LoginForm form){
        Optional<User> tempUser = userRepository.findByEmail(form.getEmail());
        if (tempUser.isEmpty()) {
            throw new IllegalArgumentException("User not exists: " + form.getEmail());
        }
        //verify password
        if(encoder.matches(form.getPassword(), tempUser.get().getPassword())){
            if(tempUser.get().isTwoFactorEnabled() == false){
                //2FA not enabled
                return ResponseDTO.fail(HTTPCode.BAD_REQUEST,"Need to enable 2FA before sign in");
            }else{
                return ResponseDTO.ok();
                //return ok to frontend, proceed to 2FA verify stage
            }
        }else{
            return ResponseDTO.error(HTTPCode.PWD_ERROR);
        }
    }

    public ResponseDTO<String> generateUser2FACode(String email){
        String secret = twoFactorService.generateSecret();
        saveUser2FASecret(email, secret);
        return ResponseDTO.ok(twoFactorService.generateQRCode(email, secret));
    }

    public void saveUser2FASecret(String email, String secret) {
        Optional<User> tempUser = userRepository.findByEmail(email);

        if (tempUser.isEmpty()) {
            throw new IllegalArgumentException("User not exists: " + email);
        }

        String encryptedSecret = aesUtil.encrypt(secret);
        User user = tempUser.get();
        user.setTwoFactorSecret(encryptedSecret);
        user.setTwoFactorEnabled(true);
        userRepository.save(user);
    }


    public ResponseDTO<Map<String, Object>> verify2FACode(String email, String code){
        Optional<User> tempUser = userRepository.findByEmail(email);
        if (tempUser.isEmpty()) {
            throw new IllegalArgumentException("User not exists: " + email);
        }
        Map<String, Object> map = new HashMap<>();

        String hashedSecret = tempUser.get().getTwoFactorSecret();
        String decodedSecret = aesUtil.decrypt(hashedSecret);
        if(twoFactorService.verifyCode(decodedSecret, code)){
            map.put("userId", tempUser.get().getId());
            map.put("userName", tempUser.get().getUsername());
            return ResponseDTO.ok(map);
        }else{
            return ResponseDTO.fail(HTTPCode.BAD_REQUEST);
        }
    }

    public ResponseDTO<String> sendEmailVerifyCode(String email) throws MessagingException {
        mailService.sendVerificationEmail(email);
        return ResponseDTO.ok();
    }

    public ResponseDTO<String> verifyEmail(String email, String code){
        if(!verificationCodeService.verifyCode(email, code)){
            return ResponseDTO.fail(HTTPCode.BAD_REQUEST, "Wrong verification code");
        }
        return ResponseDTO.ok();
    }


    public ResponseDTO<String> request2FAReset(String email, String password) {
        Optional<User> tempUser = userRepository.findByEmail(email);
        if (tempUser.isEmpty()) {
            throw new IllegalArgumentException("User not exists: " + email);
        }
        if(encoder.matches(password, tempUser.get().getPassword())){
            return ResponseDTO.error(HTTPCode.PWD_ERROR);
        }
        tempUser.get().setTwoFactorSecret(null);
        tempUser.get().setTwoFactorEnabled(false);
        userRepository.save(tempUser.get());

        return ResponseDTO.ok("Clean 2FA data, please reset your 2FA");
    }
}
