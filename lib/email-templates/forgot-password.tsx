interface ForgotPasswordEmailProps {
  userName: string;
  resetUrl: string;
  expiryMinutes?: number;
  supportEmail?: string;
}

export function getForgotPasswordEmailHTML({
  userName,
  resetUrl,
  expiryMinutes = 15,
  supportEmail = "support@homestay.com",
}: ForgotPasswordEmailProps): string {
  return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Khôi phục mật khẩu - Homestay Booking</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #e91e63;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #666;
            font-size: 16px;
          }
          .content {
            margin: 30px 0;
          }
          .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #e91e63, #ad1457);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
          }
          .reset-button:hover {
            background: linear-gradient(135deg, #ad1457, #880e4f);
          }
          .info-box {
            background: #f8f9fa;
            border-left: 4px solid #e91e63;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning-box {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          .social-links {
            margin: 20px 0;
          }
          .social-links a {
            color: #e91e63;
            text-decoration: none;
            margin: 0 10px;
          }
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            .container {
              padding: 20px;
            }
            .reset-button {
              display: block;
              width: 100%;
              box-sizing: border-box;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏠 An's Homestay</div>
            <h1 class="title">Khôi phục mật khẩu</h1>
            <p class="subtitle">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn</p>
          </div>
  
          <div class="content">
            <p>Xin chào <strong>${userName}</strong>,</p>
            
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản An's Homestay của mình. Nhấp vào nút bên dưới để tạo mật khẩu mới:</p>
  
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="reset-button">
                🔐 Đặt lại mật khẩu
              </a>
            </div>
  
            <div class="info-box">
              <h3 style="margin-top: 0; color: #e91e63;">📋 Thông tin quan trọng:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Link này có hiệu lực trong <strong>${expiryMinutes} phút</strong></li>
                <li>Chỉ sử dụng được một lần duy nhất</li>
                <li>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này</li>
              </ul>
            </div>
  
            <div class="warning-box">
              <h3 style="margin-top: 0; color: #856404;">⚠️ Lưu ý bảo mật:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Không chia sẻ link này với bất kỳ ai</li>
                <li>Đảm bảo bạn đang truy cập từ thiết bị an toàn</li>
                <li>Sử dụng mật khẩu mạnh với ít nhất 8 ký tự</li>
              </ul>
            </div>
  
            <p>Nếu nút không hoạt động, bạn có thể copy và paste link sau vào trình duyệt:</p>
            <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${resetUrl}
            </p>
          </div>
  
          <div class="footer">
            <p>Email này được gửi từ hệ thống Homestay Booking</p>
            <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ: <a href="mailto:${supportEmail}">${supportEmail}</a></p>
            
            <div class="social-links">
              <a href="#">Facebook</a> |
              <a href="#">Instagram</a> |
              <a href="#">Website</a>
            </div>
            
            <p style="font-size: 12px; color: #999;">
              © 2024 Homestay Booking. Tất cả quyền được bảo lưu.<br>
              Đây là email tự động, vui lòng không trả lời email này.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
}
