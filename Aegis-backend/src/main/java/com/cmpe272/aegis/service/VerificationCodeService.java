package com.cmpe272.aegis.service;

import jakarta.annotation.Resource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * @author :37824
 * @description:TODO
 * @date :2025/04/28 18:21
 */
@Service
public class VerificationCodeService {
    @Resource
    private StringRedisTemplate stringRedisTemplate;

    public void saveCode(String email, String code) {
        stringRedisTemplate.opsForValue().set("aegis_register:code:" + email, code, 5, TimeUnit.MINUTES);
    }

    public boolean verifyCode(String email, String inputCode) {
        String savedCode = stringRedisTemplate.opsForValue().get("register:code:" + email);
        return inputCode.equals(savedCode);
    }

}
