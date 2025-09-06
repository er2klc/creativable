import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";

interface TeamOrderButtonsProps {
  isFirst: boolean;
  isLast: boolean;
  onUpdateOrder: (direction: 'up' | 'down') => void;
}

export const TeamOrderButtons = ({ isFirst, isLast, onUpdateOrder }: TeamOrderButtonsProps) => {
  if (!onUpdateOrder) return null;

  return (
    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 bg-accent/10 rounded-md p-1.5">
      {!isFirst && (
        <Button 
          variant="ghost" 
          size="icon"
          className="h-7 w-7 hover:bg-accent"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateOrder('up');
          }}
          title="Nach oben verschieben"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
      {!isLast && (
        <Button 
          variant="ghost" 
          size="icon"
          className="h-7 w-7 hover:bg-accent"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateOrder('down');
          }}
          title="Nach unten verschieben"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};