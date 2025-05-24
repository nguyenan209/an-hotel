interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  loginUrl?: string;
  supportEmail?: string;
}

export function WelcomeEmail({
  userName,
  userEmail,
  loginUrl = "https://homestay.com/login",
  supportEmail = "support@homestay.com",
}: WelcomeEmailProps) {
  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        maxWidth: "650px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Hero Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "40px 32px",
          textAlign: "center" as const,
          position: "relative",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            width: "60px",
            height: "60px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            right: "30px",
            width: "40px",
            height: "40px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
          }}
        />

        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderRadius: "20px",
            padding: "24px",
            display: "inline-block",
            marginBottom: "24px",
            backdropFilter: "blur(10px)",
          }}
        >
          <h1
            style={{
              color: "#ffffff",
              margin: "0",
              fontSize: "28px",
              fontWeight: "700",
              letterSpacing: "-0.5px",
            }}
          >
            🏡 Homestay Booking
          </h1>
        </div>

        <h2
          style={{
            color: "#ffffff",
            margin: "0 0 12px",
            fontSize: "32px",
            fontWeight: "600",
            lineHeight: "1.2",
          }}
        >
          Chào mừng đến với gia đình!
        </h2>
        <p
          style={{
            color: "rgba(255, 255, 255, 0.9)",
            margin: "0",
            fontSize: "18px",
            fontWeight: "400",
          }}
        >
          Hành trình khám phá những trải nghiệm tuyệt vời bắt đầu từ đây
        </p>
      </div>

      {/* Main Content */}
      <div style={{ padding: "48px 32px" }}>
        {/* Welcome Message */}
        <div style={{ textAlign: "center" as const, marginBottom: "40px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#10b981",
              borderRadius: "50%",
              margin: "0 auto 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 25px rgba(16, 185, 129, 0.3)",
            }}
          >
            <span
              style={{
                fontSize: "36px",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            >
              🎉
            </span>
          </div>

          <h3
            style={{
              color: "#1f2937",
              margin: "0 0 16px",
              fontSize: "24px",
              fontWeight: "600",
            }}
          >
            Xin chào {userName}!
          </h3>
          <p
            style={{
              color: "#6b7280",
              margin: "0",
              fontSize: "16px",
              lineHeight: "1.6",
              maxWidth: "480px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Cảm ơn bạn đã tham gia cộng đồng Homestay Booking. Chúng tôi rất vui
            mừng được đồng hành cùng bạn trong những chuyến du lịch đáng nhớ sắp
            tới.
          </p>
        </div>

        {/* Features Grid */}
        <div style={{ marginBottom: "40px" }}>
          <h4
            style={{
              color: "#1f2937",
              fontSize: "20px",
              fontWeight: "600",
              textAlign: "center" as const,
              margin: "0 0 32px",
            }}
          >
            Những điều tuyệt vời đang chờ bạn:
          </h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "24px",
            }}
          >
            {/* Feature 1 */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                padding: "24px",
                textAlign: "center" as const,
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#3b82f6",
                  borderRadius: "12px",
                  margin: "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "24px" }}>🔍</span>
              </div>
              <h5
                style={{
                  color: "#1f2937",
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "0 0 8px",
                }}
              >
                Tìm kiếm thông minh
              </h5>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                  margin: "0",
                  lineHeight: "1.5",
                }}
              >
                Khám phá hàng nghìn homestay độc đáo với bộ lọc thông minh
              </p>
            </div>

            {/* Feature 2 */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                padding: "24px",
                textAlign: "center" as const,
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#10b981",
                  borderRadius: "12px",
                  margin: "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "24px" }}>💰</span>
              </div>
              <h5
                style={{
                  color: "#1f2937",
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "0 0 8px",
                }}
              >
                Giá tốt nhất
              </h5>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                  margin: "0",
                  lineHeight: "1.5",
                }}
              >
                Đảm bảo giá tốt nhất và nhiều ưu đãi hấp dẫn dành riêng cho bạn
              </p>
            </div>

            {/* Feature 3 */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                padding: "24px",
                textAlign: "center" as const,
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#f59e0b",
                  borderRadius: "12px",
                  margin: "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "24px" }}>⭐</span>
              </div>
              <h5
                style={{
                  color: "#1f2937",
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "0 0 8px",
                }}
              >
                Đánh giá tin cậy
              </h5>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                  margin: "0",
                  lineHeight: "1.5",
                }}
              >
                Hệ thống đánh giá minh bạch từ cộng đồng du khách thực tế
              </p>
            </div>

            {/* Feature 4 */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                padding: "24px",
                textAlign: "center" as const,
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#8b5cf6",
                  borderRadius: "12px",
                  margin: "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "24px" }}>🛡️</span>
              </div>
              <h5
                style={{
                  color: "#1f2937",
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "0 0 8px",
                }}
              >
                Bảo vệ toàn diện
              </h5>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                  margin: "0",
                  lineHeight: "1.5",
                }}
              >
                Hỗ trợ 24/7 và chính sách bảo vệ khách hàng toàn diện
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center" as const,
            marginBottom: "40px",
          }}
        >
          <h4
            style={{
              color: "#ffffff",
              fontSize: "22px",
              fontWeight: "600",
              margin: "0 0 16px",
            }}
          >
            Sẵn sàng bắt đầu cuộc phiêu lưu?
          </h4>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: "16px",
              margin: "0 0 24px",
              lineHeight: "1.5",
            }}
          >
            Khám phá hàng nghìn homestay tuyệt vời đang chờ đón bạn
          </p>
          <a
            href={loginUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#ffffff",
              color: "#f5576c",
              padding: "14px 32px",
              borderRadius: "50px",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: "600",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
            }}
          >
            🚀 Bắt đầu khám phá ngay
          </a>
        </div>

        {/* Tips Section */}
        <div
          style={{
            backgroundColor: "#fef7ff",
            border: "1px solid #e879f9",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "32px",
          }}
        >
          <h4
            style={{
              color: "#a21caf",
              fontSize: "18px",
              fontWeight: "600",
              margin: "0 0 16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            💡 Mẹo cho chuyến đi hoàn hảo
          </h4>
          <ul
            style={{
              color: "#7c2d12",
              fontSize: "14px",
              lineHeight: "1.6",
              paddingLeft: "20px",
              margin: "0",
            }}
          >
            <li style={{ marginBottom: "8px" }}>
              <strong>Đặt sớm:</strong> Nhận giá tốt nhất và nhiều lựa chọn hơn
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>Đọc đánh giá:</strong> Tham khảo kinh nghiệm từ du khách
              trước
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>Liên hệ chủ nhà:</strong> Hỏi thêm thông tin để có trải
              nghiệm tốt nhất
            </li>
            <li>
              <strong>Kiểm tra chính sách:</strong> Đọc kỹ điều khoản hủy và đổi
              lịch
            </li>
          </ul>
        </div>

        {/* Account Info */}
        <div
          style={{
            backgroundColor: "#f1f5f9",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "32px",
          }}
        >
          <h4
            style={{
              color: "#1e293b",
              fontSize: "18px",
              fontWeight: "600",
              margin: "0 0 16px",
            }}
          >
            📋 Thông tin tài khoản của bạn
          </h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#64748b", fontSize: "14px" }}>
                Tên tài khoản:
              </span>
              <span
                style={{
                  color: "#1e293b",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {userName}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#64748b", fontSize: "14px" }}>Email:</span>
              <span
                style={{
                  color: "#1e293b",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {userEmail}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#64748b", fontSize: "14px" }}>
                Trạng thái:
              </span>
              <span
                style={{
                  color: "#059669",
                  fontSize: "12px",
                  fontWeight: "600",
                  backgroundColor: "#d1fae5",
                  padding: "4px 12px",
                  borderRadius: "20px",
                }}
              >
                ✓ Đã xác thực
              </span>
            </div>
          </div>
        </div>

        {/* Support */}
        <div style={{ textAlign: "center" as const }}>
          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
              lineHeight: "1.5",
              margin: "0 0 16px",
            }}
          >
            Cần hỗ trợ? Chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <a
              href={`mailto:${supportEmail}`}
              style={{
                color: "#3b82f6",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              📧 {supportEmail}
            </a>
            <a
              href="tel:1900-1234"
              style={{
                color: "#3b82f6",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              📞 1900-1234
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          padding: "32px",
          textAlign: "center" as const,
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <h5
            style={{
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: "600",
              margin: "0 0 12px",
            }}
          >
            Homestay Booking
          </h5>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "14px",
              margin: "0",
            }}
          >
            Nền tảng đặt homestay hàng đầu Việt Nam
          </p>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <a
            href="#"
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              textDecoration: "none",
              fontSize: "14px",
              margin: "0 16px",
              transition: "color 0.3s ease",
            }}
          >
            🌐 Website
          </a>
          <a
            href="#"
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              textDecoration: "none",
              fontSize: "14px",
              margin: "0 16px",
              transition: "color 0.3s ease",
            }}
          >
            📘 Facebook
          </a>
          <a
            href="#"
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              textDecoration: "none",
              fontSize: "14px",
              margin: "0 16px",
              transition: "color 0.3s ease",
            }}
          >
            📸 Instagram
          </a>
          <a
            href="#"
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              textDecoration: "none",
              fontSize: "14px",
              margin: "0 16px",
              transition: "color 0.3s ease",
            }}
          >
            🐦 Twitter
          </a>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            paddingTop: "24px",
          }}
        >
          <p
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "12px",
              margin: "0",
              lineHeight: "1.5",
            }}
          >
            © 2024 Homestay Booking. Tất cả quyền được bảo lưu.
            <br />
            📍 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh, Việt Nam
            <br />
            Email này được gửi đến {userEmail} theo yêu cầu tạo tài khoản.
          </p>
        </div>
      </div>
    </div>
  );
}

// Export HTML string version for email services
export function getWelcomeEmailHTML(props: WelcomeEmailProps): string {
  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Chào mừng đến với Homestay Booking</title>
          <style>
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; padding: 20px !important; }
              .hero { padding: 30px 20px !important; }
              .content { padding: 30px 20px !important; }
              .features-grid { grid-template-columns: 1fr !important; }
              .footer-links a { margin: 0 8px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 20px; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div class="container" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);">
            <!-- Hero Section -->
            <div class="hero" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 32px; text-align: center; position: relative;">
              <div style="background-color: rgba(255, 255, 255, 0.15); border-radius: 20px; padding: 24px; display: inline-block; margin-bottom: 24px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">🏡 Homestay Booking</h1>
              </div>
              <h2 style="color: #ffffff; margin: 0 0 12px; font-size: 32px; font-weight: 600; line-height: 1.2;">Chào mừng đến với gia đình!</h2>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 18px; font-weight: 400;">Hành trình khám phá những trải nghiệm tuyệt vời bắt đầu từ đây</p>
            </div>
            
            <!-- Main Content -->
            <div class="content" style="padding: 48px 32px;">
              <div style="text-align: center; margin-bottom: 40px;">
                <div style="width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);">
                  <span style="font-size: 36px;">🎉</span>
                </div>
                <h3 style="color: #1f2937; margin: 0 0 16px; font-size: 24px; font-weight: 600;">Xin chào ${props.userName}!</h3>
                <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.6;">Cảm ơn bạn đã tham gia cộng đồng Homestay Booking. Chúng tôi rất vui mừng được đồng hành cùng bạn trong những chuyến du lịch đáng nhớ sắp tới.</p>
              </div>
              
              <!-- CTA -->
              <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 40px;">
                <h4 style="color: #ffffff; font-size: 22px; font-weight: 600; margin: 0 0 16px;">Sẵn sàng bắt đầu cuộc phiêu lưu?</h4>
                <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0 0 24px; line-height: 1.5;">Khám phá hàng nghìn homestay tuyệt vời đang chờ đón bạn</p>
                <a href="${props.loginUrl}" style="display: inline-block; background-color: #ffffff; color: #f5576c; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">🚀 Bắt đầu khám phá ngay</a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 32px; text-align: center;">
              <h5 style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 12px;">Homestay Booking</h5>
              <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin: 0 0 24px;">Nền tảng đặt homestay hàng đầu Việt Nam</p>
              <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin: 0; line-height: 1.5;">© 2024 Homestay Booking. Tất cả quyền được bảo lưu.<br/>Email này được gửi đến ${props.userEmail}</p>
            </div>
          </div>
        </body>
      </html>
    `;
}
