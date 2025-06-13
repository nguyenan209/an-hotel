import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Điều khoản dịch vụ | HomeStay",
  description: "Điều khoản và điều kiện sử dụng dịch vụ HomeStay",
};

export default function TermsPage() {
  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold">Điều khoản dịch vụ</h1>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">1. Giới thiệu</h2>
          <p className="text-muted-foreground">
            Chào mừng bạn đến với An's HomeStay. Khi bạn sử dụng dịch vụ của chúng
            tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong
            tài liệu này. Vui lòng đọc kỹ các điều khoản này.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">2. Định nghĩa</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              "An's HomeStay", "chúng tôi", "của chúng tôi" đề cập đến nền tảng
              An's HomeStay và công ty sở hữu.
            </li>
            <li>
              "Dịch vụ" đề cập đến tất cả các dịch vụ được cung cấp bởi
              An's HomeStay, bao gồm trang web, ứng dụng và các dịch vụ liên quan.
            </li>
            <li>
              "Người dùng", "bạn", "của bạn" đề cập đến cá nhân hoặc tổ chức sử
              dụng Dịch vụ của chúng tôi.
            </li>
            <li>
              "Chủ nhà" đề cập đến người dùng cung cấp chỗ ở trên nền tảng của
              chúng tôi.
            </li>
            <li>
              "Khách" đề cập đến người dùng đặt chỗ ở trên nền tảng của chúng
              tôi.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            3. Đăng ký và Tài khoản
          </h2>
          <p className="mb-3 text-muted-foreground">
            Để sử dụng một số tính năng của Dịch vụ, bạn có thể cần phải đăng ký
            tài khoản. Khi đăng ký, bạn đồng ý:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật.</li>
            <li>Duy trì tính bảo mật của mật khẩu và tài khoản của bạn.</li>
            <li>
              Chịu trách nhiệm về tất cả các hoạt động diễn ra dưới tài khoản
              của bạn.
            </li>
            <li>Thông báo ngay cho chúng tôi về bất kỳ vi phạm bảo mật nào.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            4. Đặt phòng và Thanh toán
          </h2>
          <p className="mb-3 text-muted-foreground">
            Khi đặt phòng trên HomeStay:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Bạn đồng ý thanh toán đầy đủ số tiền được hiển thị.</li>
            <li>Chúng tôi có thể thu phí đặt cọc để đảm bảo đặt phòng.</li>
            <li>
              Các chính sách hủy phòng sẽ được áp dụng theo quy định của từng
              chủ nhà.
            </li>
            <li>Chúng tôi thu phí dịch vụ cho mỗi đặt phòng thành công.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            5. Quyền và Trách nhiệm của Chủ nhà
          </h2>
          <p className="mb-3 text-muted-foreground">
            Nếu bạn là Chủ nhà trên HomeStay:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Bạn phải cung cấp thông tin chính xác về chỗ ở của mình.</li>
            <li>
              Bạn chịu trách nhiệm duy trì chỗ ở của mình trong tình trạng an
              toàn và sạch sẽ.
            </li>
            <li>
              Bạn phải tuân thủ tất cả các luật và quy định địa phương liên quan
              đến việc cho thuê ngắn hạn.
            </li>
            <li>
              Bạn có quyền từ chối khách không đáp ứng các yêu cầu hợp lý.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            6. Quyền và Trách nhiệm của Khách
          </h2>
          <p className="mb-3 text-muted-foreground">
            Nếu bạn là Khách sử dụng HomeStay:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              Bạn phải tôn trọng chỗ ở và tuân thủ các quy tắc của chủ nhà.
            </li>
            <li>
              Bạn chịu trách nhiệm về bất kỳ thiệt hại nào gây ra cho chỗ ở.
            </li>
            <li>
              Bạn không được tổ chức các sự kiện hoặc hoạt động trái phép tại
              chỗ ở.
            </li>
            <li>Bạn phải cung cấp thông tin chính xác khi đặt phòng.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">7. Chính sách Bảo mật</h2>
          <p className="text-muted-foreground">
            Việc sử dụng dịch vụ của chúng tôi cũng tuân theo Chính sách Bảo mật
            của chúng tôi, trong đó mô tả cách chúng tôi thu thập, sử dụng và
            chia sẻ thông tin cá nhân của bạn.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            8. Thay đổi Điều khoản
          </h2>
          <p className="text-muted-foreground">
            Chúng tôi có thể cập nhật Điều khoản Dịch vụ này theo thời gian.
            Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi quan trọng nào
            bằng cách đăng thông báo trên trang web của chúng tôi hoặc gửi email
            cho bạn.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">9. Liên hệ</h2>
          <p className="text-muted-foreground">
            Nếu bạn có bất kỳ câu hỏi nào về Điều khoản Dịch vụ này, vui lòng
            liên hệ với chúng tôi qua email: legal@anhomestay.click hoặc qua mẫu liên
            hệ trên trang web của chúng tôi.
          </p>
        </section>
      </div>

      <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
        <p>Cập nhật lần cuối: 13/06/2025</p>
      </div>
    </div>
  );
}
