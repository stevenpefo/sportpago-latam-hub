import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

type FilterPreset = 'this-month' | 'last-month' | 'custom' | 'all';

interface DateRangeFilterProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function DateRangeFilter({ dateRange, onDateRangeChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<FilterPreset>('this-month');
  const [showCalendar, setShowCalendar] = useState(false);

  const handlePresetClick = (preset: FilterPreset) => {
    setActivePreset(preset);
    const today = new Date();
    
    switch (preset) {
      case 'this-month':
        onDateRangeChange({
          from: startOfMonth(today),
          to: endOfMonth(today),
        });
        setShowCalendar(false);
        setOpen(false);
        break;
      case 'last-month':
        const lastMonth = subMonths(today, 1);
        onDateRangeChange({
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        });
        setShowCalendar(false);
        setOpen(false);
        break;
      case 'custom':
        setShowCalendar(true);
        break;
      case 'all':
        onDateRangeChange(undefined);
        setShowCalendar(false);
        setOpen(false);
        break;
    }
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    onDateRangeChange(range);
    if (range?.from && range?.to) {
      setOpen(false);
    }
  };

  const getButtonLabel = () => {
    if (!dateRange?.from) return 'Todas las fechas';
    if (activePreset === 'this-month') return 'Este mes';
    if (activePreset === 'last-month') return 'Mes anterior';
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'dd MMM', { locale: es })} - ${format(dateRange.to, 'dd MMM', { locale: es })}`;
    }
    return format(dateRange.from, 'dd MMM yyyy', { locale: es });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <CalendarIcon className="h-4 w-4" />
          {getButtonLabel()}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2 space-y-1 border-b">
          <Button
            variant={activePreset === 'this-month' ? 'secondary' : 'ghost'}
            size="sm"
            className="w-full justify-start"
            onClick={() => handlePresetClick('this-month')}
          >
            Este mes
          </Button>
          <Button
            variant={activePreset === 'last-month' ? 'secondary' : 'ghost'}
            size="sm"
            className="w-full justify-start"
            onClick={() => handlePresetClick('last-month')}
          >
            Mes anterior
          </Button>
          <Button
            variant={activePreset === 'custom' ? 'secondary' : 'ghost'}
            size="sm"
            className="w-full justify-start"
            onClick={() => handlePresetClick('custom')}
          >
            Rango personalizado
          </Button>
          <Button
            variant={activePreset === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            className="w-full justify-start"
            onClick={() => handlePresetClick('all')}
          >
            Todas las fechas
          </Button>
        </div>
        
        {showCalendar && (
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleCalendarSelect}
            numberOfMonths={1}
            locale={es}
            className={cn("p-3 pointer-events-auto")}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
