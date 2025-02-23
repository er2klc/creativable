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

  const { data: teamsWithUnreadMessages = [] } = useQuery({
    queryKey: ['teams-unread-messages'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          slug,
          logo_url,
          unread_count:team_direct_messages!inner(count)
        `)
        .eq('team_direct_messages.receiver_id', user.id)
        .eq('team_direct_messages.read', false)
        .order('name');

      if (error) throw error;

      const formattedData = (data || []).map(team => ({
        id: team.id,
        name: team.name,
        slug: team.slug,
        logo_url: team.logo_url,
        unread_count: parseInt(team.unread_count)
      })).sort((a, b) => b.unread_count - a.unread_count);

      return formattedData as TeamWithUnreadCount[];
    },
    refetchInterval: 10000
  });

  const handleChatClick = (team?: TeamWithUnreadCount) => {
    if (team) {
      navigate(getTeamUrl(team.slug));
      setTeamChatOpen(true);
    } else {
      setTeamChatOpen(true);
    }
  };

  const avatarUrl = getAvatarUrl(profile?.avatar_url, userEmail);
  const displayName = profile?.display_name || userEmail?.split('@')[0] || "U";

  const totalUnreadMessages = teamsWithUnreadMessages.reduce(
    (sum, team) => sum + team.unread_count, 
    0
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
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
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {teamsWithUnreadMessages.map((team) => (
              <DropdownMenuItem 
                key={team.id}
                onClick={() => handleChatClick(team)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {team.logo_url ? (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={getAvatarUrl(team.logo_url)} alt={team.name} />
                      <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}
                  <span className="truncate">{team.name}</span>
                </div>
                {team.unread_count > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {team.unread_count}
                  </Badge>
                )}
              </DropdownMenuItem>
            ))}
            {teamsWithUnreadMessages.length === 0 && (
              <DropdownMenuItem
                onClick={() => handleChatClick()}
                className="flex items-center justify-center text-muted-foreground"
              >
                Keine ungelesenen Nachrichten
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

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
