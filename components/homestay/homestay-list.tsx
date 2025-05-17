import type { Homestay } from "@/lib/types"
import { HomestayCard } from "./homestay-card"

interface HomestayListProps {
  homestays: Homestay[]
  emptyMessage?: string
}

export function HomestayList({ homestays, emptyMessage = "Không tìm thấy homestay nào" }: HomestayListProps) {
  if (homestays.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {homestays.map((homestay) => (
        <HomestayCard key={homestay.id} homestay={homestay} />
      ))}
    </div>
  )
}
