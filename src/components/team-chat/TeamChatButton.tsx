
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TeamChatDialog } from "@/components/team-chat/TeamChatDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTeamChatStore } from "@/store/useTeamChatStore";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export const TeamChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const {
    openTeamChat,
    unreadMessagesByTeam,
    lastTeamId,
    setSelectedTeamId
  } = useTeamChatStore();

  // Get team ID from current route if we're on a team page
  const getCurrentTeamId = async (teamSlug: string) => {
    const { data } = await supabase
      .from('teams')
      .select('id')
      .eq('slug', teamSlug)
      .single();
    return data?.id;
  };

  // Find team with most unread messages
  const getTeamWithMostUnreadMessages = () => {
    let maxUnread = 0;
    let teamId = null;

    Object.entries(unreadMessagesByTeam).forEach(([id, data]) => {
      if (data.totalCount > maxUnread) {
        maxUnread = data.totalCount;
        teamId = id;
      }
    });

    return teamId;
  };

  // Calculate total unread messages across all teams
  const getTotalUnreadCount = () => {
    return Object.values(unreadMessagesByTeam).reduce((total, data) => total + data.totalCount, 0);
  };

  const handleClick = async () => {
    // Try to get team from current route first
    const match = location.pathname.match(/\/team-([^/]+)/);
    let teamId = null;

    if (match) {
      const teamSlug = match[1];
      teamId = await getCurrentTeamId(teamSlug);
    }

    // If no team from route, check unread messages
    if (!teamId) {
      teamId = getTeamWithMostUnreadMessages();
    }

    // If still no team, use last active team
    if (!teamId) {
      teamId = lastTeamId;
    }

    // If we have a team ID, open team chat directly
    if (teamId) {
      openTeamChat(teamId);
    }

    setIsOpen(true);
  };

  const totalUnreadCount = getTotalUnreadCount();

  return (
    <>
      <div className={`fixed ${isMobile ? "bottom-20 right-20" : "bottom-4 right-20"} z-50`}>
        <div className="relative">
          <Button 
            onClick={handleClick}
            variant="outline" 
            size="icon" 
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-white dark:bg-gray-800"
          >
            <Users className="h-8 w-8 text-blue-500" />
          </Button>
          {totalUnreadCount > 0 && (
            <Badge 
              variant="destructive"
              className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center rounded-full"
            >
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Badge>
          )}
        </div>
      </div>

      <TeamChatDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
