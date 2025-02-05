
import { Bot, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollapsibleTrigger } from "@/components/ui/collapsible";

interface SummaryControlsProps {
  isLoading: boolean;
  hasGenerated: boolean;
  isOpen: boolean;
  buttonText: string;
  onCollapse: () => void;
  onGenerateClick: () => void;
}

export function SummaryControls({
  isLoading,
  hasGenerated,
  isOpen,
  buttonText,
  onCollapse,
  onGenerateClick
}: SummaryControlsProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-left font-normal"
          onClick={() => {
            if (hasGenerated && isOpen) {
              onGenerateClick();
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bot className="h-4 w-4 mr-2" />}
          {buttonText}
        </Button>
      </CollapsibleTrigger>
      {hasGenerated && isOpen && (
        <Button
          variant="ghost"
          size="sm"
          className="ml-2"
          onClick={onCollapse}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

