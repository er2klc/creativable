import { format, addMonths, subMonths } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ICalButton } from "./ICalButton";

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onMonthChange?: (direction: 'prev' | 'next') => void;
}

export const CalendarHeader = ({ currentDate, onDateChange }: CalendarHeaderProps) => {
  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    onDateChange(newDate);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">
          {format(currentDate, "MMMM yyyy", { locale: de })}
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ICalButton />
    </div>
  );
};