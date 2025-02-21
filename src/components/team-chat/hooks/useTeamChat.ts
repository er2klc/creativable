
import { useState } from 'react';
import { TeamMember } from '../types';
import { useTeamSession } from './useTeamSession';
import { useUserLevel } from './useUserLevel';
import { useTeamMembers } from './useTeamMembers';
import { useTeamMessages } from './useTeamMessages';

export const useTeamChat = () => {
  const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null);
  const { currentUserSession, team } = useTeamSession();
  const currentUserLevel = useUserLevel(team?.id, currentUserSession?.user?.id);
  const { teamMembers, isLoading: isLoadingMembers } = useTeamMembers(team?.id, currentUserSession?.user?.id);
  const { messages, isLoading: isLoadingMessages, sendMessage } = useTeamMessages({
    teamId: team?.id,
    selectedUserId: selectedUser?.id,
    currentUserLevel
  });

  const selectUser = (user: TeamMember) => {
    setSelectedUser(user);
  };

  return {
    selectedUser,
    messages,
    isLoading: isLoadingMembers || isLoadingMessages,
    sendMessage,
    selectUser,
    teamMembers,
    currentUserLevel
  };
};
