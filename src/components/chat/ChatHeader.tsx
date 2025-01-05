import { Info, X, ChevronUp, Bot } from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatHeaderProps {
  onMinimize: () => void;
  onClose: () => void;
}

export const ChatHeader = ({ onMinimize, onClose }: ChatHeaderProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-4 p-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              <p className="text-sm">
                Deine Daten werden ausschließlich für diesen Chat verwendet und nicht an Dritte weitergegeben. 
                Sie dienen nur dazu, dir bestmögliche und personalisierte Unterstützung zu bieten.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Bot className="h-5 w-5 text-primary" />
        <DialogTitle className="flex-1 font-orbitron">Nexus AI-Assistent</DialogTitle>
        
        <button
          onClick={onMinimize}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="h-px bg-border mt-1" />
    </div>
  );
};