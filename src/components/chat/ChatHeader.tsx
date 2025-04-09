
import { X, ChevronLeft } from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  title: string;
  onBack?: () => void;
  onClose: () => void;
}

export const ChatHeader = ({ title, onBack, onClose }: ChatHeaderProps) => {
  return (
    <div className="flex items-center gap-2 p-3 border-b">
      {onBack && (
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      <DialogTitle className="flex-1">{title}</DialogTitle>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
