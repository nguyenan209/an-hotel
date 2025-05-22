"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface HomestayOption {
  id: string
  name: string
}

interface HomestayComboboxProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  allOptionLabel?: string
  showAllOption?: boolean
  className?: string
  triggerClassName?: string
  disabled?: boolean
}

// Mock function to fetch homestays with pagination and search
interface FetchHomestaysParams {
  search?: string;
  skip?: number;
  limit?: number;
}

const fetchHomestays = async (params: FetchHomestaysParams = {}) => {
  const { search = "", skip = 0, limit = 10 } = params;

  try {
    // Gọi API thực tế
    const response = await fetch(
      `/api/admin/homestays?search=${encodeURIComponent(search)}&skip=${skip}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch homestays");
    }

    const data = await response.json();

    return {
      homestays: data.homestays || [],
      totalItems: data.totalItems || 0,
      hasMore: data.hasMore || false,
    };
  } catch (error) {
    console.error("Error fetching homestays:", error);
    return {
      homestays: [],
      totalItems: 0,
      hasMore: false,
    };
  }
};

export function HomestayCombobox({
  value,
  onValueChange,
  placeholder = "Select homestay",
  allOptionLabel = "All Homestays",
  showAllOption = false,
  className,
  triggerClassName,
  disabled = false,
}: HomestayComboboxProps) {
  const [open, setOpen] = useState(false)
  const [homestays, setHomestays] = useState<HomestayOption[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [skip, setSkip] = useState(0)
  const commandListRef = useRef<HTMLDivElement>(null)

  // Function to handle selecting a homestay
  const handleSelectHomestay = (homestayId: string) => {
    onValueChange(homestayId)
    setOpen(false)
  }

  // Function to load more homestays
  const loadMoreHomestays = async () => {
    if (isLoadingMore || !hasMore) return

    try {
      setIsLoadingMore(true)

      const nextSkip = skip + 10
      const response = await fetchHomestays({
        search: searchTerm,
        skip: nextSkip,
        limit: 10,
      })

      setHomestays((prev) => [...prev, ...response.homestays])
      setSkip(nextSkip)
      setHasMore(response.hasMore)
    } catch (error) {
      console.error("Error loading more homestays:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Function to handle search for homestays
  const handleSearch = async (value: string) => {
    setSearchTerm(value)

    try {
      // Reset pagination when search changes
      setSkip(0)
      setIsLoading(true)

      const response = await fetchHomestays({
        search: value,
        skip: 0,
        limit: 10,
      })

      setHomestays(response.homestays)
      setHasMore(response.hasMore)
    } catch (error) {
      console.error("Error searching homestays:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle scroll in the command list to implement infinite scrolling
  const handleCommandListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget

    // If scrolled to bottom (with a small threshold)
    if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && !isLoadingMore) {
      loadMoreHomestays()
    }
  }

  // Reset homestay pagination when dropdown opens
  useEffect(() => {
    if (open) {
      // Reset search and pagination when opening the dropdown
      setSearchTerm("")
      setSkip(0)

      // Fetch initial homestays
      const fetchInitialHomestays = async () => {
        try {
          setIsLoading(true)
          const response = await fetchHomestays({ limit: 10 })
          setHomestays(response.homestays)
          setHasMore(response.hasMore)
        } catch (error) {
          console.error("Error fetching initial homestays:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchInitialHomestays()
    }
  }, [open])

  // Get homestay name by ID
  const getHomestayName = (id: string) => {
    if (id === "all") return allOptionLabel
    const homestay = homestays.find((h) => h.id === id)
    return homestay ? homestay.name : placeholder
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", triggerClassName)}
          disabled={disabled}
        >
          {value ? getHomestayName(value) : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("p-0", className)}
        align="start"
        side="bottom"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command>
          <CommandInput placeholder="Search homestay..." value={searchTerm} onValueChange={handleSearch} />
          <CommandList
            ref={commandListRef}
            className="max-h-[300px] overflow-y-auto"
            onScroll={handleCommandListScroll}
          >
            <CommandEmpty>No homestay found.</CommandEmpty>
            <CommandGroup>
              {showAllOption && (
                <CommandItem value="all" onSelect={() => handleSelectHomestay("all")}>
                  <Check className={cn("mr-2 h-4 w-4", value === "all" ? "opacity-100" : "opacity-0")} />
                  {allOptionLabel}
                </CommandItem>
              )}
              {isLoading && homestays.length === 0 ? (
                <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                homestays.map((homestay) => (
                  <CommandItem
                    key={homestay.id}
                    value={homestay.name}
                    onSelect={() => handleSelectHomestay(homestay.id)}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === homestay.id ? "opacity-100" : "opacity-0")} />
                    {homestay.name}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
            {isLoadingMore && (
              <div className="py-2 text-center text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                <span className="mt-1 block">Loading more...</span>
              </div>
            )}
            {!isLoadingMore && hasMore && (
              <div className="py-2 text-center text-xs text-muted-foreground">Scroll for more...</div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
