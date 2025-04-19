
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

  const { data: teamsWithUnreadMessages = [] } = useQuery<TeamWithUnreadCount[]>({
    queryKey: ['teams-unread-messages'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      try {
        const { data: messages, error } = await supabase
          .from('team_direct_messages')
          .select(`
            team_id,
            sender_id,
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

        // Fetch all sender profiles in one batch
        const senderIds = [...new Set(messages.map(msg => msg.sender_id))];
        const { data: senderProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', senderIds);

        if (profilesError) throw profilesError;

        // Create a lookup map for profiles
        const profileMap = senderProfiles.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);

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
          
          const sender = profileMap[msg.sender_id] || { id: msg.sender_id, display_name: 'Unknown', avatar_url: null };
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
      } catch (err) {
        console.error("Error fetching unread messages:", err);
        return [];
      }
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

  const totalUnreadMessages = teamsWithUnreadMessages.reduce((sum, team) => sum + team.unread_count, 0);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setNotificationsOpen(true)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleChatClick}
        className="relative"
      >
        <MessageCircle className="h-5 w-5" />
        {totalUnreadMessages > 0 && (
          <Badge
            variant="secondary"
            className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-blue-500 text-white"
          >
            {totalUnreadMessages > 9 ? "9+" : totalUnreadMessages}
          </Badge>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback>
                {profile?.display_name?.charAt(0) || userEmail?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/billing")}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Abonnement</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/invoices")}>
            <Receipt className="mr-2 h-4 w-4" />
            <span>Rechnungen</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Abmelden</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationSidebar
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />

      <TeamChatDialog
        open={teamChatOpen}
        onOpenChange={setTeamChatOpen}
      />
    </div>
  );
};
