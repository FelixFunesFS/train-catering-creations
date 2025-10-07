import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export interface CardOption {
  id: string
  name: string
  description?: string
  isPopular?: boolean
  isPremium?: boolean
  isDietary?: boolean
  category?: string
}

interface CheckboxCardGridProps {
  options: CardOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  columns?: 1 | 2 | 3
  showLimit?: number
  categoryLabel?: string
}

export function CheckboxCardGrid({
  options,
  selected,
  onChange,
  columns = 2,
  showLimit,
  categoryLabel
}: CheckboxCardGridProps) {
  const [showAll, setShowAll] = React.useState(false)
  
  const displayedOptions = showLimit && !showAll 
    ? options.slice(0, showLimit) 
    : options
  
  const hasMore = showLimit && options.length > showLimit

  const handleToggle = (optionId: string) => {
    const newSelected = selected.includes(optionId)
      ? selected.filter((id) => id !== optionId)
      : [...selected, optionId]
    onChange(newSelected)
  }

  const gridClass = cn(
    "grid gap-3",
    columns === 1 && "grid-cols-1",
    columns === 2 && "grid-cols-1 md:grid-cols-2",
    columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  )

  return (
    <div className="space-y-4">
      <div className={gridClass}>
        {displayedOptions.map((option) => {
          const isSelected = selected.includes(option.id)
          
          return (
            <div
              key={option.id}
              onClick={() => handleToggle(option.id)}
              className={cn(
                "relative neumorphic-card-1 p-4 rounded-lg cursor-pointer min-h-[60px]",
                "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary",
                isSelected && "ring-2 ring-primary bg-primary/5"
              )}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleToggle(option.id)
                }
              }}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox indicator */}
                <div
                  className={cn(
                    "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5",
                    isSelected
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/30"
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm leading-tight">
                      {option.name}
                    </span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {option.isPopular && (
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary whitespace-nowrap">
                          Popular
                        </Badge>
                      )}
                      {option.isPremium && (
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 whitespace-nowrap">
                          Premium
                        </Badge>
                      )}
                      {option.isDietary && (
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 whitespace-nowrap">
                          Dietary
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {option.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Show more/less button */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 text-sm text-primary hover:text-primary/80 font-medium"
        >
          {showAll ? `Show Less` : `Show ${options.length - showLimit} More ${categoryLabel || 'Items'}`}
        </button>
      )}
    </div>
  )
}
