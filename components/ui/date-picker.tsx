"use client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { vi } from "date-fns/locale";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: (date: Date) => boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  date,
  setDate,
  placeholder = "Chọn ngày",
  className,
  disabled,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    // Tự động đóng popover sau khi chọn ngày
    setOpen(false);
  };

  const isDateDisabled = (day: Date) => {
    // Disable ngày trong quá khứ
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    if (day < today) return true;

    // Disable theo minDate
    if (minDate && day < minDate) return true;

    // Disable theo maxDate
    if (maxDate && day > maxDate) return true;

    // Disable theo custom function
    if (disabled && disabled(day)) return true;

    return false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "dd/MM/yyyy", { locale: vi })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          locale={vi}
          disabled={isDateDisabled}
        />
      </PopoverContent>
    </Popover>
  );
}
