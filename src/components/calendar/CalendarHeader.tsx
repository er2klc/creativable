import { format, addMonths, subMonths } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const CalendarHeader = ({ currentDate, onDateChange }: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">
        {format(currentDate, "MMMM yyyy", { locale: de })}
      </h2>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onDateChange(subMonths(currentDate, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onDateChange(addMonths(currentDate, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};