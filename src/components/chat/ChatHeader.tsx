import { X, Minus } from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatHeaderProps {
  onMinimize: (open: boolean) => void;
  onClose: () => void;
}

export const ChatHeader = ({ onMinimize, onClose }: ChatHeaderProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 p-2">
        <img 
          src="/lovable-uploads/cccafff6-9621-43ff-a997-1c2d8d3e744d.png" 
          alt="AI Assistant" 
          className="h-6 w-6 rounded-full"
        />
        
        <DialogTitle className="flex-1 font-orbitron">Nexus AI-Assistent</DialogTitle>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onMinimize(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Minimieren</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Schließen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="h-px bg-border" />
    </div>
  );
};