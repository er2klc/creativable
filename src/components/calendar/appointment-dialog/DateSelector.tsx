import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface DateSelectorProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
}

export const DateSelector = ({ selectedDate, onDateSelect }: DateSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (date: Date | null) => {
    console.log("Date selected in DateSelector:", date);
    onDateSelect(date);
    setIsOpen(false);
  };

  const handleCalendarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Calendar clicked");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal w-full",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "dd. MMMM yyyy", { locale: de })
          ) : (
            <span>Datum wählen</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        align="start"
        style={{ zIndex: 100 }}
      >
        <div 
          className="p-0"
          onClick={handleCalendarClick}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ pointerEvents: 'auto' }}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            initialFocus
            locale={de}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};