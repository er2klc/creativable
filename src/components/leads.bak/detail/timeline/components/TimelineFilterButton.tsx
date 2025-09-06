
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimelineFilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const TimelineFilterButton = ({ 
  label, 
  isActive, 
  onClick 
}: TimelineFilterButtonProps) => {
  // Function to format the filter label for display
  const formatLabel = (filter: string): string => {
    switch (filter) {
      case 'all':
        return 'Alle';
      case 'notes':
        return 'Notizen';
      case 'tasks':
        return 'Aufgaben';
      case 'messages':
        return 'Nachrichten';
      case 'files':
        return 'Dateien';
      default:
        return filter;
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "rounded-full px-4 text-sm font-medium",
        isActive 
          ? "bg-primary/10 text-primary hover:bg-primary/20" 
          : "text-gray-600 hover:bg-gray-100"
      )}
      onClick={onClick}
    >
      {formatLabel(label)}
    </Button>
  );
};
