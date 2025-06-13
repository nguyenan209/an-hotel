import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalHeader } from "@/components/layout/conditional-header";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import CustomQueryClientProvider from "@/components/providers/CustomQueryClientProvider";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "An's Homestay - Tìm và đặt homestay tuyệt vời",
  description: "Cùng An khám phá những homestay phù hợp với bạn. Tìm kiếm và đặt phòng homestay dễ dàng và nhanh chóng.",
  generator: "An's Husband",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <Head>
        <title>Homestay Booking - Tìm và đặt homestay tuyệt vời</title>
        <meta
          name="description"
          content="Cùng An khám phá những homestay phù hợp với bạn. Tìm kiếm và đặt phòng homestay dễ dàng và nhanh chóng."
        />
        <meta
          property="og:title"
          content="An's Homestay - Tìm và đặt homestay tuyệt vời"
        />
        <meta
          property="og:description"
          content="Cùng An khám phá những homestay phù hợp với bạn. Tìm kiếm và đặt phòng homestay dễ dàng và nhanh chóng."
        />
        <meta property="og:image" content="/images/sunset-beach-villa-2.png" />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_API_URL}/`}
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="An's Homestay - Tìm và đặt homestay tuyệt vời"
        />
        <meta
          name="twitter:description"
          content="Cùng An khám phá những homestay phù hợp với bạn. Tìm kiếm và đặt phòng homestay dễ dàng và nhanh chóng."
        />
        <meta name="twitter:image" content="/images/sunset-beach-villa-2.png" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <AuthProvider>
            <ConditionalHeader />
            <CustomQueryClientProvider>
              <main className="flex-1 bg-gray-50">{children}</main>
            </CustomQueryClientProvider>
            <ConditionalFooter />
          </AuthProvider>
          <Toaster position="top-center" richColors />
        </div>
      </body>
    </html>
  );
}
