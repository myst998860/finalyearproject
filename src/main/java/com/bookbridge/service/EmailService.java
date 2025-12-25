package com.bookbridge.service;

import org.springframework.beans.factory.annotation.Autowired
;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private TemplateEngine templateEngine;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.base.url}")
    private String baseUrl;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    public void sendSimpleEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        
        mailSender.send(message);
    }

    @Async
    public void sendHtmlEmail(String to, String subject, String templateName, Context context) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            
            String htmlContent = templateEngine.process(templateName, context);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Async
    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Password Reset</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Reset Your BookBridge Password</h1>
                    <p>Click the button below to reset your password:</p>
                    <a href="%s" class="button">Reset Password</a>
                    <p>Or copy and paste this link into your browser:</p>
                    <p>%s</p>
                    <p>If you did not request a password reset, please ignore this email.</p>
                    <p>Contact us at %s if you need assistance.</p>
                </div>
            </body>
            </html>
            """.formatted(resetUrl, resetUrl, fromEmail);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Reset Your BookBridge Password");
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    @Async
    public void sendWelcomeEmail(String to, String name) {
        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("loginUrl", frontendUrl + "/login");
        context.setVariable("supportEmail", fromEmail);
        
        sendHtmlEmail(to, "Welcome to BookBridge!", "welcome", context);
    }

    @Async
    public void sendOrderConfirmationEmail(String to, String name, String orderNumber) {
        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("orderNumber", orderNumber);
        context.setVariable("orderUrl", frontendUrl + "/orders/" + orderNumber);
        context.setVariable("supportEmail", fromEmail);
        
        sendHtmlEmail(to, "Your BookBridge Order Confirmation", "order-confirmation", context);
    }

    @Async
    public void sendPaymentConfirmationEmail(String to, String name, String orderNumber, String amount) {
        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("orderNumber", orderNumber);
        context.setVariable("amount", amount);
        context.setVariable("orderUrl", frontendUrl + "/orders/" + orderNumber);
        context.setVariable("supportEmail", fromEmail);
        
        sendHtmlEmail(to, "Payment Confirmation for Your BookBridge Order", "payment-confirmation", context);
    }
    
    
}
