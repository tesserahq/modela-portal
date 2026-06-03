import { format, startOfMonth, startOfWeek, subDays } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { Calendar } from '@/modules/shadcn/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/modules/shadcn/ui/button'
import { cn } from '@/modules/shadcn/lib/utils'

interface DateRangePickerProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  className?: string
}

const PRESETS = [
  { label: 'This week', days: null, type: 'week' },
  { label: 'This month', days: null, type: 'month' },
  { label: 'Last 7 days', days: 7, type: 'days' },
  { label: 'Last 30 days', days: 30, type: 'days' },
  { label: 'Last 90 days', days: 90, type: 'days' },
]

export function DateRangePicker({ dateRange, onDateRangeChange, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [tempRange, setTempRange] = useState<DateRange | undefined>(dateRange)

  useEffect(() => {
    if (open) setTempRange(dateRange)
  }, [open, dateRange])

  const handlePresetClick = (preset: (typeof PRESETS)[number]) => {
    switch (preset.type) {
      case 'week':
        setTempRange({ from: startOfWeek(new Date()), to: new Date() })
        break
      case 'month':
        setTempRange({ from: startOfMonth(new Date()), to: new Date() })
        break
      default:
        setTempRange({ from: subDays(new Date(), preset.days!), to: new Date() })
    }
  }

  const handleApply = () => {
    onDateRangeChange(tempRange)
    setOpen(false)
  }

  const handleCancel = () => {
    setTempRange(dateRange)
    setOpen(false)
  }

  const displayText = useMemo(() => {
    if (dateRange?.from) {
      if (dateRange.to) {
        return `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`
      }
      return format(dateRange.from, 'MMM d, yyyy')
    }
    return 'Select date range'
  }, [dateRange])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal rounded-sm',
            !dateRange && 'text-muted-foreground',
            className
          )}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="flex flex-col gap-1 border-r p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Quick select</p>
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handlePresetClick(p)}>
                {p.label}
              </Button>
            ))}
          </div>
          <div className="p-3">
            <Calendar
              mode="range"
              defaultMonth={tempRange?.from}
              selected={tempRange}
              onSelect={setTempRange}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t p-3">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
