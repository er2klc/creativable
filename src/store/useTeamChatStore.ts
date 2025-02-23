
import { create } from "zustand";

interface TeamChatStore {
  isOpen: boolean;
  selectedTeamId: string | null;
  selectedUserId: string | null;
  lastTeamId: string | null;
  unreadMessagesByTeam: Record<string, {
    totalCount: number;
    userCounts: Record<string, number>;
  }>;
  setOpen: (isOpen: boolean) => void;
  setSelectedTeamId: (teamId: string | null) => void;
  setSelectedUserId: (userId: string | null) => void;
  setLastTeamId: (teamId: string | null) => void;
  setUnreadMessageCount: (teamId: string, userId: string, count: number) => void;
  clearUnreadMessages: (teamId: string, userId: string) => void;
  // Helper function to open chat with team context
  openTeamChat: (teamId: string, userId?: string) => void;
}

export const useTeamChatStore = create<TeamChatStore>((set) => ({
  isOpen: false,
  selectedTeamId: null,
  selectedUserId: null,
  lastTeamId: null,
  unreadMessagesByTeam: {},
  
  setOpen: (isOpen) => set({ isOpen }),
  
  setSelectedTeamId: (teamId) => set({ selectedTeamId: teamId }),
  
  setSelectedUserId: (userId) => set({ selectedUserId: userId }),
  
  setLastTeamId: (teamId) => set({ lastTeamId: teamId }),
  
  setUnreadMessageCount: (teamId, userId, count) => 
    set((state) => {
      const teamCounts = state.unreadMessagesByTeam[teamId] || { totalCount: 0, userCounts: {} };
      const oldUserCount = teamCounts.userCounts[userId] || 0;
      const diff = count - oldUserCount;
      
      return {
        unreadMessagesByTeam: {
          ...state.unreadMessagesByTeam,
          [teamId]: {
            totalCount: teamCounts.totalCount + diff,
            userCounts: {
              ...teamCounts.userCounts,
              [userId]: count,
            },
          },
        },
      };
    }),
  
  clearUnreadMessages: (teamId, userId) =>
    set((state) => {
      const teamCounts = state.unreadMessagesByTeam[teamId];
      if (!teamCounts) return state;

      const oldUserCount = teamCounts.userCounts[userId] || 0;
      const { [userId]: _, ...remainingUserCounts } = teamCounts.userCounts;

      return {
        unreadMessagesByTeam: {
          ...state.unreadMessagesByTeam,
          [teamId]: {
            totalCount: teamCounts.totalCount - oldUserCount,
            userCounts: remainingUserCounts,
          },
        },
      };
    }),
  
  openTeamChat: (teamId, userId) =>
    set({
      isOpen: true,
      selectedTeamId: teamId,
      selectedUserId: userId || null,
      lastTeamId: teamId,
    }),
}));
