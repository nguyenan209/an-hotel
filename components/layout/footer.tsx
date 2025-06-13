import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-medium">An's HomeStay</h3>
            <p className="text-sm text-muted-foreground">
              Nền tảng đặt phòng homestay hàng đầu Việt Nam, cung cấp trải
              nghiệm lưu trú độc đáo và chất lượng.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-medium">Khám phá</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/search"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Tìm kiếm homestay
                </Link>
              </li>
              <li>
                <Link
                  href="/search?location=Đà+Nẵng"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Homestay Đà Nẵng
                </Link>
              </li>
              <li>
                <Link
                  href="/search?location=Hà+Nội"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Homestay Hà Nội
                </Link>
              </li>
              <li>
                <Link
                  href="/search?location=Hồ+Chí+Minh"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Homestay Hồ Chí Minh
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-medium">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Chính sách hoàn tiền
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Điều khoản dịch vụ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-medium">Liên hệ</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">
                Email: info@anshomestay.vn
              </li>
              <li className="text-muted-foreground">Điện thoại: 1900 1234</li>
              <li className="text-muted-foreground">
                Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} An's HomeStay. Tất cả quyền được
            bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
