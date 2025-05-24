interface ConfirmRegistrationEmailProps {
  userName: string;
  otpCode: string;
  expiryMinutes?: number;
  supportEmail?: string;
}

export function ConfirmRegistrationEmail({
  userName,
  otpCode,
  expiryMinutes = 5,
  supportEmail = "support@homestay.com",
}: ConfirmRegistrationEmailProps) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#3b82f6",
          padding: "24px",
          textAlign: "center" as const,
        }}
      >
        <h1
          style={{
            color: "#ffffff",
            margin: "0",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          Homestay Booking
        </h1>
      </div>

      {/* Content */}
      <div style={{ padding: "32px 24px" }}>
        {/* Welcome Message */}
        <div style={{ textAlign: "center" as const, marginBottom: "32px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              backgroundColor: "#10b981",
              borderRadius: "50%",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "#ffffff",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              🔐
            </span>
          </div>
          <h2
            style={{
              color: "#1f2937",
              margin: "0 0 8px",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            Mã xác nhận đăng ký
          </h2>
          <p
            style={{
              color: "#6b7280",
              margin: "0",
              fontSize: "16px",
            }}
          >
            Chào mừng bạn đến với Homestay Booking!
          </p>
        </div>

        {/* Greeting */}
        <p
          style={{
            color: "#374151",
            fontSize: "16px",
            lineHeight: "1.5",
            margin: "0 0 16px",
          }}
        >
          Xin chào <strong>{userName}</strong>,
        </p>

        <p
          style={{
            color: "#374151",
            fontSize: "16px",
            lineHeight: "1.5",
            margin: "0 0 24px",
          }}
        >
          Cảm ơn bạn đã đăng ký tài khoản tại Homestay Booking. Để hoàn tất quá
          trình đăng ký, vui lòng sử dụng mã OTP bên dưới để xác nhận địa chỉ
          email của bạn.
        </p>

        {/* OTP Code */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "2px dashed #3b82f6",
            borderRadius: "12px",
            padding: "32px 24px",
            textAlign: "center" as const,
            margin: "32px 0",
          }}
        >
          <p
            style={{
              color: "#374151",
              fontSize: "14px",
              fontWeight: "bold",
              margin: "0 0 12px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Mã xác nhận của bạn
          </p>
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "2px solid #3b82f6",
              borderRadius: "8px",
              padding: "16px 24px",
              display: "inline-block",
              margin: "0 0 16px",
            }}
          >
            <span
              style={{
                color: "#1f2937",
                fontSize: "32px",
                fontWeight: "bold",
                letterSpacing: "8px",
                fontFamily: "monospace",
              }}
            >
              {otpCode}
            </span>
          </div>
          <p
            style={{
              color: "#ef4444",
              fontSize: "14px",
              fontWeight: "bold",
              margin: "0",
            }}
          >
            ⏰ Mã này sẽ hết hạn sau {expiryMinutes} phút
          </p>
        </div>

        {/* Instructions */}
        <div
          style={{
            backgroundColor: "#f0f9ff",
            border: "1px solid #0ea5e9",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              color: "#0c4a6e",
              fontSize: "16px",
              fontWeight: "bold",
              margin: "0 0 12px",
            }}
          >
            📝 Hướng dẫn sử dụng:
          </h3>
          <ol
            style={{
              color: "#0c4a6e",
              fontSize: "14px",
              lineHeight: "1.5",
              paddingLeft: "20px",
              margin: "0",
            }}
          >
            <li style={{ marginBottom: "8px" }}>
              Quay lại trang đăng ký trên website
            </li>
            <li style={{ marginBottom: "8px" }}>
              Nhập mã OTP <strong>{otpCode}</strong> vào ô xác nhận
            </li>
            <li style={{ marginBottom: "8px" }}>
              Nhấn nút "Xác nhận" để hoàn tất đăng ký
            </li>
            <li>Bắt đầu khám phá những homestay tuyệt vời!</li>
          </ol>
        </div>

        {/* Security Notice */}
        <div
          style={{
            backgroundColor: "#fef3c7",
            border: "1px solid #f59e0b",
            borderRadius: "6px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              color: "#92400e",
              fontSize: "14px",
              margin: "0 0 8px",
              fontWeight: "bold",
            }}
          >
            🔒 Lưu ý bảo mật:
          </p>
          <ul
            style={{
              color: "#92400e",
              fontSize: "14px",
              margin: "0",
              lineHeight: "1.4",
              paddingLeft: "20px",
            }}
          >
            <li>Mã OTP này chỉ có hiệu lực trong {expiryMinutes} phút</li>
            <li>Không chia sẻ mã này với bất kỳ ai</li>
            <li>Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này</li>
          </ul>
        </div>

        {/* What's Next */}
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              color: "#1f2937",
              fontSize: "18px",
              fontWeight: "bold",
              margin: "0 0 16px",
            }}
          >
            Sau khi xác nhận, bạn có thể:
          </h3>
          <ul
            style={{
              color: "#374151",
              fontSize: "14px",
              lineHeight: "1.5",
              paddingLeft: "20px",
              margin: "0",
            }}
          >
            <li style={{ marginBottom: "8px" }}>
              🏠 Tìm kiếm và đặt homestay yêu thích
            </li>
            <li style={{ marginBottom: "8px" }}>
              ⭐ Đánh giá và chia sẻ trải nghiệm
            </li>
            <li style={{ marginBottom: "8px" }}>
              💰 Nhận ưu đãi và khuyến mãi đặc biệt
            </li>
            <li style={{ marginBottom: "8px" }}>
              📱 Quản lý đặt phòng dễ dàng
            </li>
          </ul>
        </div>

        {/* Support */}
        <p
          style={{
            color: "#6b7280",
            fontSize: "14px",
            lineHeight: "1.5",
            margin: "0",
          }}
        >
          Nếu bạn cần hỗ trợ hoặc không nhận được mã, vui lòng liên hệ với chúng
          tôi qua email{" "}
          <a
            href={`mailto:${supportEmail}`}
            style={{ color: "#3b82f6", textDecoration: "none" }}
          >
            {supportEmail}
          </a>{" "}
          hoặc hotline <strong>1900-1234</strong>.
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "24px",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <div style={{ textAlign: "center" as const, marginBottom: "16px" }}>
          <p
            style={{
              color: "#1f2937",
              fontSize: "16px",
              fontWeight: "bold",
              margin: "0 0 8px",
            }}
          >
            Homestay Booking
          </p>
          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
              margin: "0",
            }}
          >
            Khám phá những trải nghiệm lưu trú độc đáo
          </p>
        </div>

        <div style={{ textAlign: "center" as const, marginBottom: "16px" }}>
          <a
            href="#"
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontSize: "14px",
              margin: "0 12px",
            }}
          >
            Website
          </a>
          <a
            href="#"
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontSize: "14px",
              margin: "0 12px",
            }}
          >
            Facebook
          </a>
          <a
            href="#"
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontSize: "14px",
              margin: "0 12px",
            }}
          >
            Instagram
          </a>
        </div>

        <p
          style={{
            color: "#9ca3af",
            fontSize: "12px",
            textAlign: "center" as const,
            margin: "0",
            lineHeight: "1.4",
          }}
        >
          © 2024 Homestay Booking. Tất cả quyền được bảo lưu.
          <br />
          Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
          <br />
          Email này được gửi đến {userName} theo yêu cầu đăng ký tài khoản.
        </p>
      </div>
    </div>
  );
}

// Export HTML string version for email services
export function getConfirmRegistrationEmailHTML(
  props: ConfirmRegistrationEmailProps
): string {
  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mã xác nhận đăng ký - Homestay Booking</title>
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f3f4f6; font-family: Arial, sans-serif;">
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #3b82f6; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Homestay Booking</h1>
            </div>
            <div style="padding: 32px 24px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="width: 64px; height: 64px; background-color: #10b981; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: #ffffff; font-size: 24px; font-weight: bold;">🔐</span>
                </div>
                <h2 style="color: #1f2937; margin: 0 0 8px; font-size: 20px; font-weight: bold;">Mã xác nhận đăng ký</h2>
                <p style="color: #6b7280; margin: 0; font-size: 16px;">Chào mừng bạn đến với Homestay Booking!</p>
              </div>
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 16px;">Xin chào <strong>${props.userName}</strong>,</p>
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">Cảm ơn bạn đã đăng ký tài khoản tại Homestay Booking. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã OTP bên dưới để xác nhận địa chỉ email của bạn.</p>
              <div style="background-color: #f8fafc; border: 2px dashed #3b82f6; border-radius: 12px; padding: 32px 24px; text-align: center; margin: 32px 0;">
                <p style="color: #374151; font-size: 14px; font-weight: bold; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Mã xác nhận của bạn</p>
                <div style="background-color: #ffffff; border: 2px solid #3b82f6; border-radius: 8px; padding: 16px 24px; display: inline-block; margin: 0 0 16px;">
                  <span style="color: #1f2937; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">${props.otpCode}</span>
                </div>
                <p style="color: #ef4444; font-size: 14px; font-weight: bold; margin: 0;">⏰ Mã này sẽ hết hạn sau ${props.expiryMinutes || 5} phút</p>
              </div>
              <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #92400e; font-size: 14px; margin: 0 0 8px; font-weight: bold;">🔒 Lưu ý bảo mật:</p>
                <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.4;">Mã OTP này chỉ có hiệu lực trong ${props.expiryMinutes || 5} phút. Không chia sẻ mã này với bất kỳ ai.</p>
              </div>
            </div>
            <div style="background-color: #f9fafb; padding: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">© 2024 Homestay Booking. Tất cả quyền được bảo lưu.</p>
            </div>
          </div>
        </body>
      </html>
    `;
}
