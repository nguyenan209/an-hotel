import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ConditionalHeader } from "@/components/layout/conditional-header"
import { ConditionalFooter } from "@/components/layout/conditional-footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HomeStay - Đặt phòng homestay trực tuyến",
  description: "Nền tảng đặt phòng homestay hàng đầu Việt Nam",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <ConditionalHeader />
          <main className="flex-1 bg-gray-50">{children}</main>
          <ConditionalFooter />
        </div>
      </body>
    </html>
  )
}
