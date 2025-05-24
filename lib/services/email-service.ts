import { getConfirmRegistrationEmailHTML } from "../email-templates/confirm-registration";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Mock email service - thay thế bằng service thực tế như SendGrid, Nodemailer, etc.
export class EmailService {
  static async sendEmail({
    to,
    subject,
    html,
  }: SendEmailOptions): Promise<boolean> {
    try {
      // Trong thực tế, bạn sẽ tích hợp với service email như:
      // - SendGrid
      // - Nodemailer
      // - AWS SES
      // - Mailgun

      console.log("Sending email to:", to);
      console.log("Subject:", subject);
      console.log("HTML content:", html.substring(0, 200) + "...");

      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate success (90% success rate)
      const success = Math.random() > 0.1;

      if (success) {
        console.log("Email sent successfully");
        return true;
      } else {
        console.error("Failed to send email");
        return false;
      }
    } catch (error) {
      console.error("Email service error:", error);
      return false;
    }
  }

  static async sendOTPEmail(
    email: string,
    userName: string,
    otpCode: string
  ): Promise<boolean> {
    const html = getConfirmRegistrationEmailHTML({
      userName,
      otpCode,
      expiryMinutes: 5,
      supportEmail: "support@homestay.com",
    });

    return this.sendEmail({
      to: email,
      subject: `Mã xác nhận đăng ký: ${otpCode} - Homestay Booking`,
      html,
    });
  }

  static async sendWelcomeEmail(
    email: string,
    userName: string
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Chào mừng ${userName}!</h1>
        <p>Tài khoản của bạn đã được kích hoạt thành công.</p>
        <p>Bạn có thể bắt đầu khám phá và đặt homestay ngay bây giờ!</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: "Chào mừng đến với Homestay Booking!",
      html,
    });
  }
}

// OTP utility functions
export class OTPService {
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static isOTPExpired(createdAt: Date, expiryMinutes = 5): boolean {
    const now = new Date();
    const expiryTime = new Date(
      createdAt.getTime() + expiryMinutes * 60 * 1000
    );
    return now > expiryTime;
  }
}
