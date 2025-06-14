import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalHeader } from "@/components/layout/conditional-header";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import CustomQueryClientProvider from "@/components/providers/CustomQueryClientProvider";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

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
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gradient-to-r from-[#EFE4D2]/20 to-[#EFE4D2]/30`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ConditionalHeader />
            <CustomQueryClientProvider>
              <main className="flex-1">{children}</main>
            </CustomQueryClientProvider>
            <ConditionalFooter />
          </AuthProvider>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
