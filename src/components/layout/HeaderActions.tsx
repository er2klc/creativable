
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, CreditCard, Receipt, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NotificationSidebar } from "@/components/notifications/NotificationSidebar";
import { Profile } from "@/integrations/supabase/types/profiles";

interface HeaderActionsProps {
  profile?: Profile | null;
  userEmail?: string;
}

export const HeaderActions = ({ profile, userEmail }: HeaderActionsProps) => {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getInitials = (email: string) => {
    return email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <>
      <div className="hidden md:flex items-center gap-2">
        <div className="h-8 w-px bg-gray-500" />
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setNotificationsOpen(true)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
        <div className="h-6 w-px bg-gray-200" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{getInitials(userEmail || "")}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Plan</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Receipt className="mr-2 h-4 w-4" />
              <span>Rechnung</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Abmelden</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <NotificationSidebar
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </>
  );
};

