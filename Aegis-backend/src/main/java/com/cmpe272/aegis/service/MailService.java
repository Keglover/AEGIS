package com.cmpe272.aegis.service;

import com.cmpe272.aegis.model.HighRiskEmailReport;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

/**
 * @author :37824
 * @description:TODO
 * @date :2025/04/28 17:55
 */
@Slf4j
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
        log.info(toEmail+", "+verificationCode);
        helper.setFrom(mailAddress);
        helper.setTo(toEmail);
        helper.setSubject("Aegis Dependency Scanner - Email Verification Code");

        String content = "<p>Dear user,</p>"
                + "<p>You are performing a secure operation on <b>Aegis Dependency Scanner</b>.</p>"
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

    public void sendProjectCompletionEmail(String toEmail, String projectName) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom(mailAddress);
        helper.setTo(toEmail);
        helper.setSubject("Aegis Dependency Scanner - Project Scan Completed");
        LocalDateTime completedTime = LocalDateTime.now();
        String formattedTime = completedTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        String content = "<p>Dear user,</p>"
                + "<p>Your project <b>" + projectName + "</b> has been successfully scanned by <b>Aegis Dependency Scanner</b>.</p>"
                + "<p><b>Completion Time:</b> " + formattedTime + "</p>"
                + "<br>"
                + "<p>You can now log in to view the scan report, risk assessment, and recommendations.</p>"
                + "<p>If you did not initiate this project, please contact support immediately.</p>"
                + "<br><p>Regards,<br>Aegis Security Team</p>";

        helper.setText(content, true);
        mailSender.send(message);
    }

    public void sendProjectFailureEmail(String toEmail, String projectName, String reason) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom(mailAddress);
        helper.setTo(toEmail);
        helper.setSubject("Aegis Dependency Scanner - Project Scan Failed");
        LocalDateTime failedTime = LocalDateTime.now();
        String formattedTime = failedTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        String content = "<p>Dear user,</p>"
                + "<p>Unfortunately, your project <b>" + projectName + "</b> failed to complete the scan on <b>Aegis Dependency Scanner</b>.</p>"
                + "<p><b>Failure Time:</b> " + formattedTime + "</p>"
                + "<p><b>Reason:</b> " + reason + "</p>"
                + "<br>"
                + "<p>Please try re-uploading the project. If the issue persists, contact our support team for assistance.</p>"
                + "<br><p>Regards,<br>Aegis Security Team</p>";

        helper.setText(content, true);
        mailSender.send(message);
    }


    public void sendHighRiskDependencyEmail(String toEmail, String projectName, List<HighRiskEmailReport> highRiskDependencies) throws MessagingException {
        if (highRiskDependencies == null || highRiskDependencies.isEmpty()) {
            log.info("No high-risk dependencies to report for project: {}", projectName);
            sendProjectCompletionEmail(toEmail, projectName);
            return;
        }

        String subject = "[Aegis] Alert: High Risk Dependencies Found in Your Project";

        StringBuilder contentBuilder = new StringBuilder();
        contentBuilder.append("<p>Dear user,</p>");
        contentBuilder.append("<p>Your project <b>").append(projectName).append("</b> has been scanned and the following high-risk dependencies were found:</p>");
        contentBuilder.append("<table border=\"1\" cellpadding=\"6\" cellspacing=\"0\" style=\"border-collapse: collapse;\">");
        contentBuilder.append("<tr><th>Dependency</th><th>Version</th><th>CVE Details</th></tr>");

        for (HighRiskEmailReport report : highRiskDependencies) {
            contentBuilder.append("<tr>")
                    .append("<td>").append(report.getDependencyName()).append("</td>")
                    .append("<td>").append(report.getDependencyVersion()).append("</td>")
                    .append("<td><a href=\"").append(report.getCveUrl()).append("\">").append(report.getCveUrl()).append("</a></td>")
                    .append("</tr>");
        }

        contentBuilder.append("</table>");
        contentBuilder.append("<p>Please address these issues as soon as possible to avoid potential security threats.</p>");
        contentBuilder.append("<p>Best regards,<br/>Aegis Security Team</p>");

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(contentBuilder.toString(), true);

        mailSender.send(message);
        log.info("Sent high-risk dependency report to {}", toEmail);
    }


}
