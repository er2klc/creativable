import { format, addMonths, subMonths } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Appointment } from "./types/calendar";

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onMonthChange?: (direction: 'prev' | 'next') => void;
  multiDayEvents?: Appointment[];
}

export const CalendarHeader = ({ 
  currentDate, 
  onDateChange,
  multiDayEvents = []
}: CalendarHeaderProps) => {
  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    onDateChange(newDate);
  };

  return (
    <div className="space-y-2">
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
        
        {multiDayEvents.length > 0 && (
          <div className="flex gap-2 items-center">
            {multiDayEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 px-3 py-1 rounded-md text-sm"
                style={{ backgroundColor: `${event.color}30` }}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: event.color }}
                />
                <span>{event.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};