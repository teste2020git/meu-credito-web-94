
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface MonthYearPickerProps {
  value?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

const months = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
]

export function MonthYearPicker({ value, onSelect, placeholder = "Selecionar mês", className }: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedMonth, setSelectedMonth] = React.useState<number | undefined>(value?.getMonth())
  const [selectedYear, setSelectedYear] = React.useState<number>(value?.getFullYear() || new Date().getFullYear())

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  const handleMonthClick = (monthIndex: number) => {
    setSelectedMonth(monthIndex)
  }

  const handleYearChange = (direction: 'prev' | 'next') => {
    setSelectedYear(prev => direction === 'prev' ? prev - 1 : prev + 1)
  }

  const handleClear = () => {
    setSelectedMonth(undefined)
    setSelectedYear(currentYear)
    onSelect?.(undefined)
    setIsOpen(false)
  }

  const handleSet = () => {
    if (selectedMonth !== undefined) {
      const newDate = new Date(selectedYear, selectedMonth)
      onSelect?.(newDate)
    }
    setIsOpen(false)
  }

  const formatDisplayValue = () => {
    if (!value) return placeholder
    return `${months[value.getMonth()]} ${value.getFullYear()}`
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {formatDisplayValue()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="text-center font-medium">Selecionar mês</div>
          
          {/* Year selector */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleYearChange('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[60px] text-center">{selectedYear}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleYearChange('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => (
              <Button
                key={month}
                variant={selectedMonth === index ? "default" : "outline"}
                className="h-10"
                onClick={() => handleMonthClick(index)}
              >
                {month}
              </Button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between pt-2 border-t">
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80"
              onClick={handleClear}
            >
              LIMPAR
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="text-primary hover:text-primary/80"
                onClick={() => setIsOpen(false)}
              >
                CANCELAR
              </Button>
              <Button
                variant="ghost"
                className="text-primary hover:text-primary/80 font-medium"
                onClick={handleSet}
                disabled={selectedMonth === undefined}
              >
                DEFINIR
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
