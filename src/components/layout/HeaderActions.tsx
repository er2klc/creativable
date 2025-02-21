
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, CreditCard, Receipt, LogOut, MessageCircle } from "lucide-react";
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
import { getAvatarUrl } from "@/lib/supabase-utils";
import { useProfile } from "@/hooks/use-profile";
import { TeamChatDialog } from "@/components/team-chat/TeamChatDialog";
import { useTeamChatStore } from "@/store/useTeamChatStore";

interface HeaderActionsProps {
  profile?: Profile | null;
  userEmail?: string;
}

export const HeaderActions = ({ userEmail }: HeaderActionsProps) => {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { data: profile } = useProfile();
  const teamChatOpen = useTeamChatStore((state) => state.isOpen);
  const setTeamChatOpen = useTeamChatStore((state) => state.setOpen);

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

  const { data: unreadMessages = 0 } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('team_direct_messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', profile?.id)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 10000,
    enabled: !!profile?.id
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const avatarUrl = getAvatarUrl(profile?.avatar_url, userEmail);
  const displayName = profile?.display_name || userEmail?.split('@')[0] || "U";

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
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setTeamChatOpen(true)}
        >
          <MessageCircle className="h-5 w-5" />
          {unreadMessages > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadMessages}
            </Badge>
          )}
        </Button>
        <div className="h-6 w-px bg-gray-200" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
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

      <TeamChatDialog 
        open={teamChatOpen}
        onOpenChange={setTeamChatOpen}
      />
    </>
  );
};
