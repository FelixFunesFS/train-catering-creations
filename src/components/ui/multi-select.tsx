import * as React from "react"
import { Check, ChevronDown, X, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface Option {
  label: string
  value: string
  category?: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  maxDisplayed?: number
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  className,
  maxDisplayed = 3,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange(selected.filter((item) => item !== value))
  }

  const selectedOptions = options.filter((option) => selected.includes(option.value))
  const displayedSelected = selectedOptions.slice(0, maxDisplayed)
  const remainingCount = selectedOptions.length - maxDisplayed

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!searchValue.trim()) return options
    const search = searchValue.toLowerCase()
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(search) ||
        option.category?.toLowerCase().includes(search)
    )
  }, [options, searchValue])

  // Group filtered options by category
  const groupedOptions = React.useMemo(() => {
    const groups: { [key: string]: Option[] } = {}
    
    filteredOptions.forEach((option) => {
      const category = option.category || "Options"
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(option)
    })
    
    return groups
  }, [filteredOptions])

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="input"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-[2.5rem] h-auto px-3 py-2",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {displayedSelected.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="text-xs"
                  >
                    {option.label}
                    <button
                      type="button"
                      className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={(e) => handleRemove(option.value, e)}
                    >
                      <X className="h-3 w-3 cursor-pointer hover:text-destructive" />
                    </button>
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    +{remainingCount} more
                  </Badge>
                )}
              </>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] min-w-[200px] p-0 bg-popover border shadow-lg z-[9999]" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Search Input */}
        <div className="flex items-center border-b px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            type="text"
            className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        
        {/* Options List */}
        <ScrollArea className="max-h-[300px]">
          <div className="p-1">
            {Object.keys(groupedOptions).length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No items found.
              </div>
            ) : (
              Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                <div key={category}>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {category}
                  </div>
                  {categoryOptions.map((option) => (
                    <div
                      key={option.value}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelect(option.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleSelect(option.value)
                        }
                      }}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus:bg-accent focus:text-accent-foreground",
                        selected.includes(option.value) && "bg-accent/50"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selected.includes(option.value) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
