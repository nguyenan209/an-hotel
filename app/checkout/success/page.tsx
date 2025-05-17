"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle, Home, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cartStore"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const { items } = useCartStore()

  // Redirect to home if no booking was made
  useEffect(() => {
    if (items.length > 0) {
      router.push("/cart")
    }
  }, [items, router])

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Đặt phòng thành công!</h1>

        <p className="text-muted-foreground mb-8">
          Cảm ơn bạn đã đặt phòng tại Homestay của chúng tôi. Thông tin đặt phòng đã được gửi đến email của bạn.
        </p>

        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Quay lại trang chủ
            </Button>
          </Link>

          <Link href="/bookings">
            <Button variant="outline" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Xem đặt phòng của tôi
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
