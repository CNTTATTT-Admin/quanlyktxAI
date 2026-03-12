package com.cntt.rentalmanagement.services.impl;

import com.cntt.rentalmanagement.services.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

@Service
public class MailServiceImpl implements MailService {

    @Autowired
    private JavaMailSender mailSender;

    @Async
    @Override
    public void sendEmailConfirmed(String email, String name) throws MessagingException, IOException {
        MimeMessage message = mailSender.createMimeMessage();
        message.setFrom(new InternetAddress("khanhhn.hoang@gmail.com"));
        message.setRecipients(MimeMessage.RecipientType.TO, email);
        message.setSubject("Xác thực tài khoản.");

        String htmlTemplate = readFileConfirmed();

        htmlTemplate = htmlTemplate.replace("NAME", name);
        htmlTemplate = htmlTemplate.replace("EMAIL", email);

        message.setContent(htmlTemplate, "text/html; charset=utf-8");

        mailSender.send(message);
    }

    @Async
    @Override
    public void sendEmailFromTemplate(String email) throws MessagingException, IOException {
        MimeMessage message = mailSender.createMimeMessage();
        message.setFrom(new InternetAddress("khanhhn.hoang@gmail.com"));
        message.setRecipients(MimeMessage.RecipientType.TO, email);
        message.setSubject("Yêu cầu cấp lại mật khẩu!!!");

        String htmlTemplate = readFile();

        htmlTemplate = htmlTemplate.replace("EMAILINFO", email);

        message.setContent(htmlTemplate, "text/html; charset=utf-8");

        mailSender.send(message);
    }

    private String readFile() throws IOException {
        File file = ResourceUtils.getFile("classpath:forgot-password.html");
        byte[] encoded = Files.readAllBytes(file.toPath());
        return new String(encoded, StandardCharsets.UTF_8);
    }

    private String readFileConfirmed() throws IOException {
        File file = ResourceUtils.getFile("classpath:confirm-email.html");
        byte[] encoded = Files.readAllBytes(file.toPath());
        return new String(encoded, StandardCharsets.UTF_8);
    }
}
