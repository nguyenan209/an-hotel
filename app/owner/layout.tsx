import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Sidebar } from "@/components/admin/layout/sidebar";
import { Header } from "@/components/admin/layout/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HomeStay Admin",
  description: "Admin panel for HomeStay booking system",
};

export default function OwnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${inter.className} min-h-screen admin-layout`}>
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:z-50">
        <Sidebar />
      </div>
      <div className="lg:pl-16 transition-all duration-300 admin-main-content">
        <Header />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
