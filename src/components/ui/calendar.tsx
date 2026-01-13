import * as React from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isSameDay, 
  isAfter, 
  isBefore,
  setMonth,
  setYear
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DAYS_OF_WEEK = ["L", "M", "M", "J", "V", "S", "D"];

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

interface DateRange {
  from?: Date;
  to?: Date;
}

interface CalendarPropsBase {
  disabled?: (date: Date) => boolean;
  className?: string;
  initialFocus?: boolean;
  defaultMonth?: Date;
  fromYear?: number;
  toYear?: number;
  captionLayout?: "buttons" | "dropdown" | "dropdown-buttons";
  numberOfMonths?: number;
  showOutsideDays?: boolean;
  classNames?: Record<string, string>;
  locale?: unknown; // Accept but ignore for compatibility
}

interface CalendarPropsSingle extends CalendarPropsBase {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

interface CalendarPropsRange extends CalendarPropsBase {
  mode: "range";
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
}

type CalendarProps = CalendarPropsSingle | CalendarPropsRange;

function Calendar(props: CalendarProps) {
  const {
    disabled,
    className,
    defaultMonth,
    fromYear = 1940,
    toYear = new Date().getFullYear(),
    captionLayout = "buttons",
  } = props;
  
  const mode = props.mode || "single";
  const [currentMonth, setCurrentMonth] = useState(defaultMonth || new Date());
  const [rangeStart, setRangeStart] = useState<Date | undefined>(
    mode === "range" && props.mode === "range" && props.selected?.from
      ? props.selected.from
      : undefined
  );

  const years = Array.from(
    { length: toYear - fromYear + 1 },
    (_, i) => fromYear + i
  ).reverse();

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleMonthChange = (value: string) => {
    setCurrentMonth(setMonth(currentMonth, parseInt(value)));
  };

  const handleYearChange = (value: string) => {
    setCurrentMonth(setYear(currentMonth, parseInt(value)));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    if (mode === "single" && props.mode !== "range") {
      props.onSelect?.(today);
    }
  };

  const handleDateClick = (date: Date) => {
    if (disabled && disabled(date)) return;

    if (mode === "single" && props.mode !== "range") {
      props.onSelect?.(date);
    } else if (mode === "range" && props.mode === "range") {
      if (!rangeStart) {
        setRangeStart(date);
        props.onSelect?.({ from: date, to: undefined });
      } else {
        if (isBefore(date, rangeStart)) {
          props.onSelect?.({ from: date, to: rangeStart });
        } else {
          props.onSelect?.({ from: rangeStart, to: date });
        }
        setRangeStart(undefined);
      }
    }
  };

  const getSelected = (): Date | DateRange | undefined => {
    if (props.mode === "range") {
      return props.selected;
    }
    return props.selected;
  };

  const isDateSelected = (date: Date): boolean => {
    const selected = getSelected();
    if (!selected) return false;
    
    if (mode === "single" && selected instanceof Date) {
      return isSameDay(date, selected);
    }
    
    if (mode === "range" && typeof selected === "object" && "from" in selected) {
      const rangeSelected = selected as DateRange;
      if (rangeSelected.from && rangeSelected.to) {
        return (
          isSameDay(date, rangeSelected.from) ||
          isSameDay(date, rangeSelected.to) ||
          (isAfter(date, rangeSelected.from) && isBefore(date, rangeSelected.to))
        );
      }
      if (rangeSelected.from) {
        return isSameDay(date, rangeSelected.from);
      }
    }
    
    return false;
  };

  const isRangeEnd = (date: Date): boolean => {
    if (mode === "range" && props.mode === "range" && props.selected) {
      return props.selected.to ? isSameDay(date, props.selected.to) : false;
    }
    return false;
  };

  const isRangeStart = (date: Date): boolean => {
    if (mode === "range" && props.mode === "range" && props.selected) {
      return props.selected.from ? isSameDay(date, props.selected.from) : false;
    }
    return false;
  };

  const isInRange = (date: Date): boolean => {
    if (mode === "range" && props.mode === "range" && props.selected) {
      if (props.selected.from && props.selected.to) {
        return isAfter(date, props.selected.from) && isBefore(date, props.selected.to);
      }
    }
    return false;
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows: Date[][] = [];
  let days: Date[] = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = addDays(day, 1);
    }
    rows.push(days);
    days = [];
  }

  const showDropdowns = captionLayout === "dropdown" || captionLayout === "dropdown-buttons";

  return (
    <div className={cn("p-4 pointer-events-auto bg-popover", className)}>
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          className="h-10 w-10 min-h-[44px] min-w-[44px]"
          type="button"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          {showDropdowns ? (
            <>
              <Select
                value={currentMonth.getMonth().toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="w-auto h-10 min-h-[44px] text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={currentMonth.getFullYear().toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-auto h-10 min-h-[44px] text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : (
            <span className="text-base font-semibold">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-10 w-10 min-h-[44px] min-w-[44px]"
          type="button"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_OF_WEEK.map((dayName, index) => (
          <div
            key={index}
            className="h-10 flex items-center justify-center text-sm font-medium text-muted-foreground"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {rows.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isToday = isSameDay(date, new Date());
            const isDisabled = disabled ? disabled(date) : false;
            const selected = isDateSelected(date);
            const rangeStartDay = isRangeStart(date);
            const rangeEndDay = isRangeEnd(date);
            const inRange = isInRange(date);

            return (
              <button
                key={`${weekIndex}-${dayIndex}`}
                type="button"
                onClick={() => handleDateClick(date)}
                disabled={isDisabled}
                className={cn(
                  "h-10 w-full min-h-[44px] flex items-center justify-center text-sm rounded-md transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  !isCurrentMonth && "text-muted-foreground/40",
                  isCurrentMonth && !selected && !isToday && "hover:bg-accent",
                  isToday && !selected && "bg-accent text-accent-foreground font-semibold",
                  (rangeStartDay || rangeEndDay || (selected && mode === "single")) && 
                    "bg-primary text-primary-foreground font-semibold hover:bg-primary",
                  inRange && "bg-accent",
                  isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                )}
              >
                {format(date, "d")}
              </button>
            );
          })
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="flex-1 min-h-[44px]"
          type="button"
        >
          Hoy
        </Button>
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
export type { CalendarProps };
