
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TeamChatDialog } from "@/components/team-chat/TeamChatDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTeamChatStore } from "@/store/useTeamChatStore";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const ChatButton = () => {
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

    // If we have a team ID, set it and open chat
    if (teamId) {
      setSelectedTeamId(teamId);
    }

    setIsOpen(true);
  };

  return (
    <>
      <div className={`fixed ${isMobile ? "bottom-20 right-4" : "bottom-4 right-4"} z-50`}>
        <Button 
          onClick={handleClick}
          variant="outline" 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all p-0 overflow-hidden bg-white dark:bg-gray-800"
        >
          <img 
            src="/lovable-uploads/cccafff6-9621-43ff-a997-1c2d8d3e744d.png" 
            alt="Chat" 
            className="w-full h-full object-cover"
          />
        </Button>
      </div>

      <TeamChatDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
