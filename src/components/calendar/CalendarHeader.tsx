import { format, addMonths, subMonths } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  draggedAppointment?: any;
  onMonthChange?: (direction: 'prev' | 'next') => void;
}

export const CalendarHeader = ({ 
  currentDate, 
  onDateChange,
  draggedAppointment,
  onMonthChange 
}: CalendarHeaderProps) => {
  const { setNodeRef: setPrevRef, isOver: isPrevOver } = useDroppable({
    id: 'prev-month',
  });

  const { setNodeRef: setNextRef, isOver: isNextOver } = useDroppable({
    id: 'next-month',
  });

  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    onDateChange(newDate);
    onMonthChange?.('prev');
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    onDateChange(newDate);
    onMonthChange?.('next');
  };

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">
        {format(currentDate, "MMMM yyyy", { locale: de })}
      </h2>
      <div className="flex gap-2">
        <div
          ref={setPrevRef}
          className={`transition-colors ${isPrevOver && draggedAppointment ? 'bg-accent' : ''}`}
        >
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <div
          ref={setNextRef}
          className={`transition-colors ${isNextOver && draggedAppointment ? 'bg-accent' : ''}`}
        >
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};