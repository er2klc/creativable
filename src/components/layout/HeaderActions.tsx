
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
import { getTeamUrl } from "@/lib/navigation/team-navigation";

interface HeaderActionsProps {
  profile?: Profile | null;
  userEmail?: string;
}

interface TeamWithUnreadCount {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  unread_count: number;
  unread_by_user: Record<string, {
    count: number;
    display_name: string;
    avatar_url?: string;
  }>;
}

export const HeaderActions = ({ userEmail }: HeaderActionsProps) => {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { data: profile } = useProfile();
  const teamChatOpen = useTeamChatStore((state) => state.isOpen);
  const openTeamChat = useTeamChatStore((state) => state.openTeamChat);
  const setTeamChatOpen = useTeamChatStore((state) => state.setOpen);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

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

  const { data: teamsWithUnreadMessages = [] } = useQuery({
    queryKey: ['teams-unread-messages'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: messages, error } = await supabase
        .from('team_direct_messages')
        .select(`
          team_id,
          sender:sender_id (
            id,
            display_name,
            avatar_url
          ),
          teams!inner (
            id,
            name,
            slug,
            logo_url
          )
        `)
        .eq('receiver_id', user.id)
        .eq('read', false);

      if (error) throw error;

      const teamMessages = messages.reduce((acc, msg) => {
        const team = msg.teams;
        if (!acc[team.id]) {
          acc[team.id] = {
            id: team.id,
            name: team.name,
            slug: team.slug,
            logo_url: team.logo_url,
            unread_count: 0,
            unread_by_user: {}
          };
        }
        
        const sender = msg.sender;
        if (!acc[team.id].unread_by_user[sender.id]) {
          acc[team.id].unread_by_user[sender.id] = {
            count: 0,
            display_name: sender.display_name,
            avatar_url: sender.avatar_url
          };
        }
        
        acc[team.id].unread_count++;
        acc[team.id].unread_by_user[sender.id].count++;
        
        return acc;
      }, {} as Record<string, TeamWithUnreadCount>);

      return Object.values(teamMessages).sort((a, b) => b.unread_count - a.unread_count);
    },
    refetchInterval: 10000
  });

  const handleChatClick = () => {
    // If there are teams with unread messages, open the one with most unread messages
    const teamWithMostUnread = teamsWithUnreadMessages[0];
    if (teamWithMostUnread) {
      openTeamChat(teamWithMostUnread.id);
    }
    
    // Open the chat dialog regardless
    setTeamChatOpen(true);
  };

  const totalUnreadMessages = teamsWithUnreadMessages.reduce(
    (sum, team) => sum + team.unread_count, 
    0
  );

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
          onClick={handleChatClick}
        >
          <MessageCircle className="h-5 w-5" />
          {totalUnreadMessages > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalUnreadMessages}
            </Badge>
          )}
        </Button>

        <div className="h-6 w-px bg-gray-200" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={profile?.avatar_url || ""} alt={profile?.display_name || ""} />
              <AvatarFallback>{(profile?.display_name || "").substring(0, 2).toUpperCase()}</AvatarFallback>
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
