import { Loader2 } from "lucide-react";

export default function CheckoutSuccessLoading() {
  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
        <h1 className="text-2xl font-semibold mb-4">Đang xử lý đặt phòng...</h1>
        <p className="text-muted-foreground">
          Vui lòng chờ trong giây lát, chúng tôi đang hoàn tất đặt phòng của
          bạn.
        </p>
      </div>
    </div>
  );
}
