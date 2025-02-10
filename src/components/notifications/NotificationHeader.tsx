
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface NotificationHeaderProps {
  onMarkAllRead: () => void;
  onClose: () => void;
}

export const NotificationHeader = ({ onMarkAllRead, onClose }: NotificationHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <SheetHeader className="flex-1">
        <SheetTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Benachrichtigungen
        </SheetTitle>
      </SheetHeader>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMarkAllRead}
          className="flex items-center gap-1"
        >
          <Check className="h-4 w-4" />
          Alle als gelesen markieren
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
