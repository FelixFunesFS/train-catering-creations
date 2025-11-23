import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: (date: Date) => boolean
  className?: string
  onFocus?: () => void
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled,
  className,
  onFocus,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-12 text-base w-full justify-start text-left font-normal input-clean",
            !value && "text-muted-foreground",
            className
          )}
          onClick={onFocus}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-background border shadow-lg z-50" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={disabled}
          initialFocus
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  )
}
