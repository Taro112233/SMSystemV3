// components/ShowcaseComponent/CalendarShowcase/index.tsx
"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import { addDays } from "date-fns"

export function CalendarShowcase() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  })
  const [multipleDates, setMultipleDates] = React.useState<Date[] | undefined>([
    new Date(),
    addDays(new Date(), 2),
    addDays(new Date(), 5),
  ])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Calendar</h3>
      <p className="text-sm text-muted-foreground">
        A date field component that allows users to enter and edit date.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Single Date */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Single Date Selection</h4>
          <div className="rounded-md border">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Selected: {date?.toLocaleDateString()}
          </p>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Date Range Selection</h4>
          <div className="rounded-md border">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              className="rounded-md"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Range: {dateRange?.from?.toLocaleDateString()} - {dateRange?.to?.toLocaleDateString()}
          </p>
        </div>

        {/* Multiple Dates */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Multiple Date Selection</h4>
          <div className="rounded-md border">
            <Calendar
              mode="multiple"
              selected={multipleDates}
              onSelect={setMultipleDates}
              className="rounded-md"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Selected: {multipleDates?.length || 0} dates
          </p>
        </div>
      </div>
    </div>
  )
}