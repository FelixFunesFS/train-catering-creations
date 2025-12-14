import { format, startOfWeek, endOfWeek, addDays, addWeeks, addMonths, subWeeks, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DateNavigationProps {
  currentDate: Date;
  viewMode: 'week' | 'month';
  onDateChange: (date: Date) => void;
}

export function DateNavigation({ currentDate, viewMode, onDateChange }: DateNavigationProps) {
  const handlePrevious = () => {
    if (viewMode === 'week') {
      onDateChange(subWeeks(currentDate, 1));
    } else {
      onDateChange(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      onDateChange(addWeeks(currentDate, 1));
    } else {
      onDateChange(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getDisplayText = () => {
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    }
    return format(currentDate, 'MMMM yyyy');
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={handlePrevious} className="h-8 w-8">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button variant="outline" size="sm" onClick={handleToday} className="h-8 px-3">
        <Calendar className="h-3.5 w-3.5 mr-1.5" />
        Today
      </Button>
      
      <Button variant="outline" size="icon" onClick={handleNext} className="h-8 w-8">
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      <span className="text-sm font-medium text-muted-foreground ml-2 hidden sm:inline">
        {getDisplayText()}
      </span>
    </div>
  );
}
