import { Info } from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const ChatHeader = () => {
  return (
    <div className="flex items-center gap-2">
      <DialogTitle className="flex-1">Chat mit KI-Assistent</DialogTitle>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          </TooltipTrigger>
          <TooltipContent className="max-w-[300px]">
            <p className="text-sm">
              Deine Daten werden ausschließlich für diesen Chat verwendet und nicht an Dritte weitergegeben. 
              Sie dienen nur dazu, dir bestmögliche und personalisierte Unterstützung zu bieten.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};