"use client"

import { usePathname } from "next/navigation"
import { Header } from "./header"

export function ConditionalHeader() {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith("/admin")
  const isOwnerPage = pathname?.startsWith("/owner")
  const isRegisterConfirmPage = pathname?.startsWith("/register/confirm")

  if (pathname === "/host/register") {
    return null
  }

  if (isAdminPage || isRegisterConfirmPage || isOwnerPage) {
    return null
  }

  return <Header />
}
