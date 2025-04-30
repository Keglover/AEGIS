package com.cmpe272.aegis.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import org.springframework.stereotype.Service;

@Service
public class TwoFactorService {

    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    private final String appName = "Aegis%20Application";

    public String generateSecret() {
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        return key.getKey();
    }

    public String generateQRCode(String email, String secret) {
        GoogleAuthenticatorKey key = new GoogleAuthenticatorKey.Builder(secret).build();
        return GoogleAuthenticatorQRGenerator.getOtpAuthURL(appName, email, key);
    }

    public boolean verifyCode(String secret, String codeStr) {
        if (codeStr == null || !codeStr.matches("^\\d{6}$")) {
            return false;
        }

        try {
            int code = Integer.parseInt(codeStr);
            return gAuth.authorize(secret, code);
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
