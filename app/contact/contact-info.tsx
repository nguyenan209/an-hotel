import { Mail, MapPin, Phone, Clock } from "lucide-react";

export function ContactInfo() {
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Thông tin liên hệ</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <Phone className="h-5 w-5 text-primary mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium">Điện thoại</h3>
              <p className="text-muted-foreground">
                <a href="tel:1900-1234" className="hover:text-primary">
                  0989 046 891
                </a>
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium">Email</h3>
              <p className="text-muted-foreground">
                <a
                  href="mailto:info@homestay.vn"
                  className="hover:text-primary"
                >
                  an5230001@utc.lms.edu.vn
                </a>
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium">Địa chỉ</h3>
              <p className="text-muted-foreground">
                Trường ĐH GTVT, Số 3 Cầu Giấy, Phường Láng, TP. Hà Nội
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-primary mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium">Giờ làm việc</h3>
              <p className="text-muted-foreground">
                Thứ 2 - Thứ 6: 8:00 - 18:00
              </p>
              <p className="text-muted-foreground">Thứ 7: 8:00 - 12:00</p>
              <p className="text-muted-foreground">Chủ nhật: Nghỉ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Vị trí của chúng tôi</h2>
        <div className="aspect-video w-full rounded-md overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.1132410573346!2d105.80084557548965!3d21.02815448062109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab424a50fff9%3A0xbe3a7f3670c0a45f!2zVHLGsOG7nW5nIMSQ4bqhaSBI4buNYyBHaWFvIFRow7RuZyBW4bqtbiBU4bqjaQ!5e0!3m2!1svi!2s!4v1752591785299!5m2!1svi!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
