"use client"

import { usePathname } from "next/navigation"
import { Header } from "./header"

export function ConditionalHeader() {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith("/admin")
  const isRegisterConfirmPage = pathname?.startsWith("/register/confirm")

  if (isAdminPage || isRegisterConfirmPage) {
    return null
  }

  return <Header />
}
