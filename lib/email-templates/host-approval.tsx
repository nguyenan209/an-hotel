interface HostApprovalEmailProps {
  hostName: string;
  username: string;
  password: string;
  loginUrl: string;
  supportEmail: string;
}

export function getHostApprovalEmailHTML({
  hostName,
  username,
  password,
  loginUrl,
  supportEmail,
}: HostApprovalEmailProps): string {
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chúc mừng! Bạn đã được phê duyệt làm Host</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Chúc mừng ${hostName}!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Bạn đã được phê duyệt làm Host</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #2c3e50; margin-top: 0;">Thông tin đăng nhập</h2>
            <p>Tài khoản Host của bạn đã được tạo thành công. Dưới đây là thông tin đăng nhập:</p>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0;"><strong>🔗 Link đăng nhập:</strong> <a href="${loginUrl}" style="color: #3498db;">${loginUrl}</a></p>
              <p style="margin: 10px 0 0 0;"><strong>👤 Tên đăng nhập:</strong> ${username}</p>
              <p style="margin: 10px 0 0 0;"><strong>🔑 Mật khẩu:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password}</code></p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;"><strong>⚠️ Lưu ý bảo mật:</strong> Vui lòng đổi mật khẩu ngay sau lần đăng nhập đầu tiên để đảm bảo an toàn tài khoản.</p>
            </div>
          </div>
  
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2c3e50; margin-top: 0;">🚀 Bước tiếp theo</h3>
            <ol style="padding-left: 20px;">
              <li style="margin-bottom: 10px;"><strong>Đăng nhập vào hệ thống</strong> - Sử dụng thông tin đăng nhập ở trên</li>
              <li style="margin-bottom: 10px;"><strong>Hoàn thiện hồ sơ</strong> - Cập nhật thông tin cá nhân và doanh nghiệp</li>
              <li style="margin-bottom: 10px;"><strong>Tạo listing đầu tiên</strong> - Thêm homestay của bạn vào hệ thống</li>
              <li style="margin-bottom: 10px;"><strong>Thiết lập thanh toán</strong> - Cấu hình tài khoản ngân hàng để nhận tiền</li>
              <li style="margin-bottom: 10px;"><strong>Bắt đầu đón khách</strong> - Homestay của bạn sẽ hiển thị trên platform</li>
            </ol>
          </div>
  
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2c3e50; margin-top: 0;">📋 Quy định và chính sách</h3>
            <p>Là Host trên platform, bạn cần tuân thủ:</p>
            <ul style="padding-left: 20px;">
              <li>Cung cấp thông tin chính xác về homestay</li>
              <li>Duy trì chất lượng dịch vụ tốt</li>
              <li>Phản hồi khách hàng trong vòng 24h</li>
              <li>Tuân thủ các quy định về an toàn và vệ sinh</li>
            </ul>
          </div>
  
          <div style="background: white; padding: 25px; border-radius: 8px;">
            <h3 style="color: #2c3e50; margin-top: 0;">💬 Hỗ trợ</h3>
            <p>Nếu bạn cần hỗ trợ hoặc có câu hỏi, đừng ngần ngại liên hệ:</p>
            <p>📧 Email: <a href="mailto:${supportEmail}" style="color: #3498db;">${supportEmail}</a></p>
            <p>📞 Hotline: 1900-xxxx (8:00 - 22:00 hàng ngày)</p>
            <p>💬 Live Chat: Có sẵn trong hệ thống quản lý Host</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; color: #7f8c8d; font-size: 14px;">
          <p>Email này được gửi tự động từ hệ thống Homestay Booking Platform</p>
          <p>© 2024 Homestay Booking. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
}

interface HostRejectionEmailProps {
  hostName: string;
  rejectionReason: string;
  supportEmail: string;
  reapplyUrl: string;
}

export function getHostRejectionEmailHTML({
  hostName,
  rejectionReason,
  supportEmail,
  reapplyUrl,
}: HostRejectionEmailProps): string {
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thông báo về đơn đăng ký Host</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #e74c3c; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Thông báo đơn đăng ký Host</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Xin chào ${hostName}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #2c3e50; margin-top: 0;">📋 Kết quả xem xét</h2>
            <p>Cảm ơn bạn đã quan tâm và đăng ký làm Host trên platform của chúng tôi.</p>
            <p>Sau khi xem xét kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng đơn đăng ký của bạn chưa được phê duyệt vào thời điểm này.</p>
            
            <div style="background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h4 style="color: #c33; margin-top: 0;">Lý do:</h4>
              <p style="margin: 0; color: #666;">${rejectionReason}</p>
            </div>
          </div>
  
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2c3e50; margin-top: 0;">🔄 Đăng ký lại</h3>
            <p>Bạn có thể cải thiện các vấn đề được nêu và đăng ký lại:</p>
            <ul style="padding-left: 20px;">
              <li>Xem xét và khắc phục các vấn đề được nêu</li>
              <li>Chuẩn bị đầy đủ giấy tờ và thông tin cần thiết</li>
              <li>Đảm bảo homestay đáp ứng các tiêu chuẩn chất lượng</li>
            </ul>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${reapplyUrl}" style="background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Đăng ký lại</a>
            </div>
          </div>
  
          <div style="background: white; padding: 25px; border-radius: 8px;">
            <h3 style="color: #2c3e50; margin-top: 0;">💬 Hỗ trợ</h3>
            <p>Nếu bạn cần hỗ trợ hoặc có câu hỏi về quy trình đăng ký:</p>
            <p>📧 Email: <a href="mailto:${supportEmail}" style="color: #3498db;">${supportEmail}</a></p>
            <p>📞 Hotline: 1900-xxxx (8:00 - 22:00 hàng ngày)</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; color: #7f8c8d; font-size: 14px;">
          <p>Email này được gửi tự động từ hệ thống Homestay Booking Platform</p>
          <p>© 2024 Homestay Booking. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
}
