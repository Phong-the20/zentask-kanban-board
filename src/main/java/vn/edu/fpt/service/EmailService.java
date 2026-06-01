package vn.edu.fpt.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendAssignmentNotification(String toEmail, String taskTitle, String boardOrWorkspaceName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("You have been assigned a task in ZenTask");
        message.setText(
                "Hello,\n\n" +
                "You have been assigned to task: \"" + taskTitle + "\"\n" +
                "in " + boardOrWorkspaceName + ".\n\n" +
                "Please log in to ZenTask to view and manage your tasks.\n\n" +
                "Best regards,\n" +
                "ZenTask Team"
        );
        mailSender.send(message);
    }

    @Async
    public void sendOtpEmail(String toEmail, String otp, String purpose) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Your " + purpose + " OTP Code – ZenTask");

            String html = """
                    <!DOCTYPE html>
                    <html>
                    <head><meta charset="UTF-8"></head>
                    <body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
                      <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 0">
                        <tr><td align="center">
                          <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
                            <tr><td style="padding:40px 32px 32px 32px;text-align:center">
                              <h1 style="font-size:24px;font-weight:700;color:#1e293b;margin:0 0 8px 0">ZenTask</h1>
                              <p style="font-size:15px;color:#64748b;margin:0 0 4px 0">Your %s OTP code is:</p>
                              <div style="font-size:40px;font-weight:800;color:#4f46e5;letter-spacing:8px;margin:16px 0;font-family:monospace">%s</div>
                              <p style="font-size:13px;color:#94a3b8;margin:0">This code expires in 5 minutes.</p>
                            </td></tr>
                            <tr><td style="padding:0 32px 24px 32px;text-align:center;font-size:12px;color:#94a3b8">
                              If you did not request this code, please ignore this email. &copy; 2026 ZenTask
                            </td></tr>
                          </table>
                        </td></tr>
                      </table>
                    </body>
                    </html>
                    """.formatted(purpose, otp);

            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    @Async
    public void sendInvitationEmail(String toEmail, String workspaceName, String inviterName, String token) {
        String acceptUrl = "http://localhost:5173/workspace/accept-invite?token=" + token;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("You're invited to join " + workspaceName + " on ZenTask");

            String html = """
                    <!DOCTYPE html>
                    <html>
                    <head><meta charset="UTF-8"></head>
                    <body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
                      <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 0">
                        <tr><td align="center">
                          <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
                            <tr><td style="padding:40px 32px 32px 32px;text-align:center">
                              <h1 style="font-size:24px;font-weight:700;color:#1e293b;margin:0 0 8px 0">ZenTask</h1>
                              <p style="font-size:15px;color:#64748b;margin:0 0 24px 0">
                                <strong>%s</strong> invited you to join <strong>%s</strong>
                              </p>
                              <a href="%s" style="display:inline-block;background-color:#4f46e5;color:#ffffff;font-size:15px;font-weight:600;padding:14px 40px;border-radius:10px;text-decoration:none">
                                Accept Invitation
                              </a>
                              <p style="font-size:13px;color:#94a3b8;margin:24px 0 0 0">
                                This link expires in 24 hours.
                              </p>
                            </td></tr>
                            <tr><td style="padding:0 32px 24px 32px;text-align:center;font-size:12px;color:#94a3b8">
                              &copy; 2026 ZenTask &middot; All rights reserved.
                            </td></tr>
                          </table>
                        </td></tr>
                      </table>
                    </body>
                    </html>
                    """.formatted(inviterName, workspaceName, acceptUrl);

            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send invitation email", e);
        }
    }
}
