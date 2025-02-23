
import { useState } from 'react';
import { TeamMember } from '../types';
import { useTeamSession } from './useTeamSession';
import { useUserLevel } from './useUserLevel';
import { useTeamMembers } from './useTeamMembers';
import { useTeamMessages } from './useTeamMessages';
import { toast } from 'sonner';
import { useUser } from '@supabase/auth-helpers-react';

export const useTeamChat = () => {
  const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null);
  const currentUser = useUser();
  const { currentUserSession, team, isLoading: isLoadingSession } = useTeamSession();
  const { currentUserLevel, isLoadingLevel } = useUserLevel(team?.id, currentUser?.id);
  const { teamMembers, isLoading: isLoadingMembers } = useTeamMembers(team?.id, currentUser?.id);
  const { messages, isLoading: isLoadingMessages, sendMessage } = useTeamMessages({
    teamId: team?.id,
    selectedUserId: selectedUser?.id,
    currentUserLevel
  });

  const selectUser = (user: TeamMember) => {
    if (!currentUserLevel || currentUserLevel < 3) {
      toast.error('Du benötigst Level 3 oder höher um Nachrichten zu senden.');
      return;
    }
    setSelectedUser(user);
  };

  const isLoading = isLoadingSession || isLoadingLevel || isLoadingMembers || isLoadingMessages;

  return {
    selectedUser,
    messages,
    isLoading,
    sendMessage,
    selectUser,
    teamMembers,
    currentUserLevel
  };
};
