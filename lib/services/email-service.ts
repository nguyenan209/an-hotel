import { sendEmail } from "../email";
import { getConfirmRegistrationEmailHTML } from "../email-templates/confirm-registration";
import { getHostApprovalEmailHTML, getHostRejectionEmailHTML } from "../email-templates/host-approval";
import { getWelcomeEmailHTML } from "../email-templates/welcome-email";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  static async sendEmail({
    to,
    subject,
    html,
  }: SendEmailOptions): Promise<boolean> {
    try {
      await sendEmail({ to, subject, html });
      console.log("Email sent successfully");
      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
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
    const html = getWelcomeEmailHTML({
      userName,
      userEmail: "support@homestay.com",
    });

    return this.sendEmail({
      to: email,
      subject: "Chào mừng đến với Homestay Booking!",
      html,
    });
  }

  static async sendHostApprovalEmail(
    email: string,
    hostName: string,
    username: string,
    password: string,
  ): Promise<boolean> {
    const html = getHostApprovalEmailHTML({
      hostName,
      username,
      password,
      loginUrl: process.env.NEXT_PUBLIC_BASE_URL + "/login",
      supportEmail: "host-support@homestay.com",
    })

    return this.sendEmail({
      to: email,
      subject: "🎉 Chúc mừng! Bạn đã được phê duyệt làm Host - Homestay Booking",
      html,
    })
  }

  static async sendHostRejectionEmail(email: string, hostName: string, rejectionReason: string): Promise<boolean> {
    const html = getHostRejectionEmailHTML({
      hostName,
      rejectionReason,
      supportEmail: "host-support@homestay.com",
      reapplyUrl: "https://homestay.com/host/register",
    })

    return this.sendEmail({
      to: email,
      subject: "Thông báo về đơn đăng ký Host - Homestay Booking",
      html,
    })
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
