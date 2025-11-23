import * as React from "react"
import { Clock } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TimeSelectProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  onFocus?: () => void
  interval?: 15 | 30
}

// Generate time slots for a day
const generateTimeSlots = (interval: 15 | 30 = 30): { value: string; label: string }[] => {
  const slots: { value: string; label: string }[] = []
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      const period = hour < 12 ? "AM" : "PM"
      const minuteStr = minute.toString().padStart(2, "0")
      const hourStr24 = hour.toString().padStart(2, "0")
      
      const value = `${hourStr24}:${minuteStr}`
      const label = `${displayHour}:${minuteStr} ${period}`
      
      slots.push({ value, label })
    }
  }
  
  return slots
}

export function TimeSelect({
  value,
  onChange,
  placeholder = "Select time",
  className,
  onFocus,
  interval = 30,
}: TimeSelectProps) {
  const timeSlots = React.useMemo(() => generateTimeSlots(interval), [interval])

  return (
    <Select 
      value={value} 
      onValueChange={onChange}
      onOpenChange={(open) => open && onFocus?.()}
    >
      <SelectTrigger className={`h-12 text-base input-clean ${className}`}>
        <Clock className="mr-2 h-4 w-4" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-background border shadow-lg z-50 max-h-[300px]">
        {timeSlots.map((slot) => (
          <SelectItem key={slot.value} value={slot.value}>
            {slot.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
