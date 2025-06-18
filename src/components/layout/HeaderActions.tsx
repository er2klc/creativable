
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationSidebar } from "@/components/notifications/NotificationSidebar";
import { useState } from "react";

interface HeaderActionsProps {
  userEmail?: string;
}

export const HeaderActions = ({ userEmail }: HeaderActionsProps) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsNotificationOpen(true)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
      </Button>
      
      <Avatar className="h-8 w-8">
        <AvatarImage src={undefined} />
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      
      <NotificationSidebar 
        open={isNotificationOpen}
        onOpenChange={setIsNotificationOpen}
      />
    </div>
  );
};
