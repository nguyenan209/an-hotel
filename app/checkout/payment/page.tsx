"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { QrCode, User, ArrowRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useCartStore } from "@/lib/store/cartStore"
import { BookingSummary } from "@/components/checkout/booking-summary"
import { QrCodePayment } from "@/components/checkout/qr-code-payment"

export default function PaymentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"qr_code" | "reception">("qr_code")
  const [isProcessing, setIsProcessing] = useState(false)
  const { items, getTotalPrice, clearCart } = useCartStore()

  // Fix hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Redirect to cart if no items
  if (items.length === 0) {
    if (typeof window !== "undefined") {
      router.push("/cart")
    }
    return null
  }

  const totalPrice = getTotalPrice()

  const handleCompleteBooking = async () => {
    setIsProcessing(true)

    // Simulate API call to create booking
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Clear cart and show success message
    clearCart()

    // Show success toast
    toast({
      title: "Đặt phòng thành công!",
      description: "Thông tin đặt phòng đã được gửi đến email của bạn.",
      variant: "default",
    })

    // Redirect to success page
    router.push("/checkout/success")
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold">Thanh toán</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Phương thức thanh toán</h2>

            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as "qr_code" | "reception")}
              className="space-y-4"
            >
              <div
                className={`border rounded-lg p-4 ${paymentMethod === "qr_code" ? "border-primary bg-primary/5" : ""}`}
              >
                <div className="flex items-start">
                  <RadioGroupItem value="qr_code" id="qr_code" className="mt-1" />
                  <div className="ml-3 flex-1">
                    <Label htmlFor="qr_code" className="text-base font-medium flex items-center">
                      <QrCode className="mr-2 h-5 w-5" />
                      Thanh toán bằng mã QR
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán
                    </p>

                    {paymentMethod === "qr_code" && <QrCodePayment amount={totalPrice} className="mt-4" />}
                  </div>
                </div>
              </div>

              <div
                className={`border rounded-lg p-4 ${paymentMethod === "reception" ? "border-primary bg-primary/5" : ""}`}
              >
                <div className="flex items-start">
                  <RadioGroupItem value="reception" id="reception" className="mt-1" />
                  <div className="ml-3">
                    <Label htmlFor="reception" className="text-base font-medium flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Thanh toán trực tiếp tại Lễ tân
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Thanh toán bằng tiền mặt hoặc thẻ khi nhận phòng
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCompleteBooking} size="lg" disabled={isProcessing} className="w-full md:w-auto">
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Hoàn thành đặt phòng
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <BookingSummary items={items} totalPrice={totalPrice} />
        </div>
      </div>
    </div>
  )
}
