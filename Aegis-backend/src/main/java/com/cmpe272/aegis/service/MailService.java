package com.cmpe272.aegis.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

/**
 * @author :37824
 * @description:TODO
 * @date :2025/04/28 17:55
 */
@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private VerificationCodeService verificationCodeService;

    @Value("${spring.mail.username}")
    private String mailAddress;
    public void sendVerificationEmail(String toEmail) throws MessagingException {
        String verificationCode = generateSixDigitString();
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom(mailAddress);
        helper.setTo(toEmail);
        helper.setSubject("Aegis Cyber Alert - Email Verification Code");

        String content = "<p>Dear user,</p>"
                + "<p>You are performing a secure operation on <b>Aegis Cyber Alert</b>.</p>"
                + "<p>Please use the following code to verify your email:</p>"
                + "<h2 style='color: #2e6c80;'>" + verificationCode + "</h2>"
                + "<p>This code is valid for <b>5 minutes</b>.</p>"
                + "<br>"
                + "<p>If you did not initiate this request, please ignore this email or contact support.</p>"
                + "<br><p>Regards,<br>Aegis Security Team</p>";

        helper.setText(content, true);
        verificationCodeService.saveCode(toEmail, verificationCode);
        mailSender.send(message);
    }

    public static String generateSixDigitString() {
        Random random = new Random();
        int number = random.nextInt(1000000);
        return String.format("%06d", number);
    }

}
