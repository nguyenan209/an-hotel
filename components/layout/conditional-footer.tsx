"use client"

import { usePathname } from "next/navigation"
import { Footer } from "./footer"

export function ConditionalFooter() {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith("/admin")
  const isOwnerPage = pathname?.startsWith("/owner")

  if (isAdminPage || isOwnerPage) {
    return null
  }
  
  if (pathname === "/host/register") {
    return null
  }

  return <Footer />
}
