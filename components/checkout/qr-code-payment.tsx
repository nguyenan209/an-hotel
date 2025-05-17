import Image from "next/image"
import { formatCurrency } from "@/lib/utils"

interface QrCodePaymentProps {
  amount: number
  className?: string
}

export function QrCodePayment({ amount, className = "" }: QrCodePaymentProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="bg-white p-4 rounded-lg border">
        <Image src="/images/payment-qr-code.png" alt="Mã QR thanh toán" width={200} height={200} className="mx-auto" />
      </div>

      <div className="mt-4 text-center">
        <p className="font-medium">Số tiền: {formatCurrency(amount)}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Đơn hàng sẽ tự động được xác nhận sau khi thanh toán thành công
        </p>
      </div>
    </div>
  )
}
