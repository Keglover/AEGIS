package com.cmpe272.aegis.component;

/**
 * @author :37824
 * @description:TODO
 * @date :2025/04/16 16:01
 */
import org.springframework.beans.factory.annotation.Value;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * @author :37824
 * @description:TODO
 * @date :2025/04/15 1:24
 */
public class AESUtil {
    private static String secretKey;
    @Value("${aes.key}")
    public void setSecretKey(String key) {
        AESUtil.secretKey = key;
    }
    private static final String ALGORITHM = "AES";

    public static String encrypt(String plainText) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            SecretKeySpec key = new SecretKeySpec(secretKey.getBytes(), ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("加密失败", e);
        }
    }

    public static String decrypt(String cipherText) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            SecretKeySpec key = new SecretKeySpec(secretKey.getBytes(), ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] decoded = Base64.getDecoder().decode(cipherText);
            return new String(cipher.doFinal(decoded), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("解密失败", e);
        }
    }

    public static String decryptLast4(String cipherText) {
        if (cipherText.isEmpty()) {
            return "****";
        }
        try {
            String plainText = decrypt(cipherText);
            if (plainText.length() <= 4) {
                return plainText;
            }
            return "****" + plainText.substring(plainText.length() - 4);
        } catch (Exception e) {
            return "****";
        }
    }

}


