package com.cmpe272.aegis.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class TwoFactorService {

    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    private final String appName = "Aegis%20Dependency%20Scanner";

    public String generateSecret() {
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        return key.getKey();
    }

    public String generateQRCode(String email, String secret) {
        String gURL = String.format(
                "otpauth://totp/%s:%s?secret=%s&issuer=%s",
                appName,
                email,
                secret,
                appName
        );
        log.info("QR code URL: "+gURL);
        return gURL;
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
