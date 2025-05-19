import type { Metadata } from "next";

import { ContactForm } from "./contact-form";
import { ContactInfo } from "./contact-info";

export const metadata: Metadata = {
  title: "Liên hệ - HomeStay",
  description: "Liên hệ với chúng tôi để được hỗ trợ và giải đáp thắc mắc",
};

export default function ContactPage() {
  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Liên hệ với chúng tôi</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng
          tôi qua form dưới đây hoặc thông tin liên lạc.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <ContactForm />
        <ContactInfo />
      </div>
    </div>
  );
}
