package movie.swp391.serviceImp;

import lombok.RequiredArgsConstructor;
import movie.swp391.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.MessagingException;
import org.springframework.mail.javamail.MimeMessageHelper;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private void sendEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void sendPasswordResetEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset Request");
        message.setText("To reset your password, please use the following OTP code:\n\n" +
                token + "\n\n" +
                "This OTP will expire in 24 hours.\n\n" +
                "If you did not request a password reset, please ignore this email.");

        mailSender.send(message);
    }

    @Override
    public void sendVerificationEmail(String to, String otpCode) {
        String subject = "Email Verification";
        String content = String.format(
                """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; padding: 20px 0; background-color: #f8f9fa; border-radius: 5px; margin-bottom: 20px;">
                        <h1>Email Verification</h1>
                    </div>
                    
                     <p>Thank you for registering! To complete your registration, please use the following OTP code:</p>
                    
                     <div style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #007bff; padding: 20px; background-color: #f8f9fa; border-radius: 5px; margin: 20px 0;">
                         %s
                     </div>
                    
                     <p>This OTP code will expire in 24 hours. If you did not request this verification, please ignore this email.</p>
                    
                     <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
    <p>This is an automated message, please do not reply to this email.</p>
                     </div>
                 </div>
                 """, otpCode);
        sendEmail(to, subject, content);
    }
    @Override
    public void sendEmployeeAccountInfoEmail(String to, String username, String password) {
        String subject = "Thông tin tài khoản nhân viên";
        String content = String.format(
                """
                <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">
                    <div style=\"text-align: center; padding: 20px 0; background-color: #f8f9fa; border-radius: 5px; margin-bottom: 20px;\">
                        <h1>Chào mừng bạn đến với hệ thống!</h1>
                    </div>
                    <p>Bạn đã được tạo tài khoản nhân viên trên hệ thống. Dưới đây là thông tin đăng nhập:</p>
                    <ul>
                        <li><b>Tên đăng nhập:</b> %s</li>
                        <li><b>Mật khẩu:</b> %s</li>
                    </ul>
                    <p>Vui lòng đăng nhập và đổi mật khẩu sau khi đăng nhập lần đầu để đảm bảo an toàn.</p>
                    <div style=\"text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;\">
                        <p>Đây là email tự động, vui lòng không trả lời email này.</p>
                    </div>
                </div>
                """, username, password);
        sendEmail(to, subject, content);
    }
}