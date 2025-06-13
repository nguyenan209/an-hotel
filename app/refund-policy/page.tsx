import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách hoàn tiền | An's Homestay",
  description:
    "Tìm hiểu về chính sách hoàn tiền của An's Homestay. Chúng tôi cam kết đảm bảo sự hài lòng của khách hàng với các chính sách hoàn tiền rõ ràng và công bằng.",
};

export default function RefundPolicyPage() {
  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        Chính sách hoàn tiền
      </h1>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Giới thiệu</h2>
          <p>
            Tại An's Homestay, chúng tôi cam kết mang đến cho khách hàng trải
            nghiệm lưu trú tuyệt vời. Chúng tôi hiểu rằng đôi khi có những tình
            huống không lường trước được có thể xảy ra, vì vậy chúng tôi đã xây
            dựng chính sách hoàn tiền công bằng và minh bạch.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Điều kiện hoàn tiền</h2>

          <h3 className="text-xl font-medium mt-6 mb-3">
            Hủy đặt phòng trước 7 ngày
          </h3>
          <p>
            Nếu bạn hủy đặt phòng ít nhất 7 ngày trước ngày nhận phòng, bạn sẽ
            được hoàn lại 100% số tiền đã thanh toán, trừ phí dịch vụ (nếu có).
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">
            Hủy đặt phòng trong vòng 3-7 ngày
          </h3>
          <p>
            Nếu bạn hủy đặt phòng trong khoảng thời gian từ 3 đến 7 ngày trước
            ngày nhận phòng, bạn sẽ được hoàn lại 70% số tiền đã thanh toán.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">
            Hủy đặt phòng trong vòng 48 giờ - 3 ngày
          </h3>
          <p>
            Nếu bạn hủy đặt phòng trong khoảng thời gian từ 48 giờ đến 3 ngày
            trước ngày nhận phòng, bạn sẽ được hoàn lại 50% số tiền đã thanh
            toán.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">
            Hủy đặt phòng trong vòng 48 giờ
          </h3>
          <p>
            Nếu bạn hủy đặt phòng trong vòng 48 giờ trước ngày nhận phòng, chúng
            tôi không thể hoàn tiền cho bạn.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Quy trình hoàn tiền</h2>
          <p>Để yêu cầu hoàn tiền, vui lòng thực hiện theo các bước sau:</p>
          <ol className="list-decimal pl-6 space-y-2 mt-4">
            <li>
              Đăng nhập vào tài khoản của bạn trên trang web An's Homestay
            </li>
            <li>Truy cập vào mục "Đặt phòng của tôi"</li>
            <li>Chọn đặt phòng bạn muốn hủy</li>
            <li>Nhấp vào nút "Hủy đặt phòng"</li>
            <li>Chọn lý do hủy và xác nhận yêu cầu hoàn tiền</li>
          </ol>
          <p className="mt-4">
            Bạn cũng có thể liên hệ với đội ngũ hỗ trợ khách hàng của chúng tôi
            qua email
            <a
              href="mailto:support@anhomestay.click"
              className="text-primary mx-1"
            >
              support@anhomestay.click
            </a>
            hoặc số điện thoại{" "}
            <span className="font-medium">1800-2345-678</span> để được hỗ trợ.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Thời gian xử lý hoàn tiền
          </h2>
          <p>Sau khi yêu cầu hoàn tiền của bạn được chấp thuận:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              Đối với thanh toán bằng thẻ tín dụng/ghi nợ: 5-10 ngày làm việc
            </li>
            <li>Đối với thanh toán qua ví điện tử: 2-5 ngày làm việc</li>
            <li>
              Đối với thanh toán chuyển khoản ngân hàng: 3-7 ngày làm việc
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Phương thức hoàn tiền</h2>
          <p>
            Số tiền hoàn lại sẽ được chuyển về phương thức thanh toán ban đầu
            bạn đã sử dụng khi đặt phòng. Trong trường hợp không thể hoàn tiền
            qua phương thức ban đầu, chúng tôi sẽ liên hệ với bạn để thảo luận
            về các phương thức thay thế.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Các trường hợp đặc biệt
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3">
            Trường hợp bất khả kháng
          </h3>
          <p>
            Trong trường hợp có sự kiện bất khả kháng (thiên tai, dịch bệnh,
            v.v.), chúng tôi sẽ xem xét hoàn tiền đầy đủ hoặc cho phép đổi lịch
            đặt phòng mà không tính phí.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">
            Vấn đề về chất lượng dịch vụ
          </h3>
          <p>
            Nếu bạn gặp vấn đề nghiêm trọng về chất lượng dịch vụ tại An's
            Homestay mà không được khắc phục trong thời gian lưu trú, vui lòng
            báo cáo ngay cho chúng tôi. Chúng tôi sẽ xem xét hoàn tiền một phần
            hoặc toàn bộ tùy theo tình huống cụ thể.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Liên hệ hỗ trợ</h2>
          <p>
            Nếu bạn có bất kỳ câu hỏi nào về chính sách hoàn tiền của chúng tôi,
            vui lòng liên hệ:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              Email:{" "}
              <a href="mailto:support@anshomestay.vn" className="text-primary">
                support@anshomestay.vn
              </a>
            </li>
            <li>
              Điện thoại: 1800-2345-678 (8:00 - 22:00, tất cả các ngày trong
              tuần)
            </li>
            <li>Văn phòng: 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</li>
          </ul>
        </section>

        <section className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-muted-foreground">
            Chính sách này được cập nhật lần cuối vào ngày 13/06/2025. An's
            Homestay có quyền thay đổi chính sách này mà không cần thông báo
            trước. Vui lòng kiểm tra lại chính sách này trước khi đặt phòng.
          </p>
        </section>
      </div>
    </div>
  );
}
