import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY); // Đảm bảo bạn đã cấu hình API key trong biến môi trường

interface SendEmailOptions {
  to: string; // Địa chỉ email người nhận
  subject: string; // Tiêu đề email
  html: string; // Nội dung HTML của email
  from?: string; // Địa chỉ email người gửi (tùy chọn, nếu không sẽ dùng mặc định)
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
  try {
    const response = await resend.emails.send({
      from: from || "onboarding@resend.dev", // Thay bằng email mặc định của bạn
      to,
      subject,
      html,
    });

    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
}
