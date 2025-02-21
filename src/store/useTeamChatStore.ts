
import { create } from "zustand";

interface TeamChatStore {
  isOpen: boolean;
  selectedUserId: string | null;
  lastTeamId: string | null;
  lastMessageSenderId: string | null;
  unreadMessagesByUser: Record<string, number>;
  setOpen: (isOpen: boolean) => void;
  setSelectedUserId: (userId: string | null) => void;
  setLastTeamId: (teamId: string | null) => void;
  setLastMessageSenderId: (userId: string | null) => void;
  setUnreadMessageCount: (userId: string, count: number) => void;
  clearUnreadMessages: (userId: string) => void;
  // Helper function to open chat with a specific user in a specific team
  openChatWithUser: (userId: string, teamId: string) => void;
}

export const useTeamChatStore = create<TeamChatStore>((set) => ({
  isOpen: false,
  selectedUserId: null,
  lastTeamId: null,
  lastMessageSenderId: null,
  unreadMessagesByUser: {},
  
  setOpen: (isOpen) => set({ isOpen }),
  
  setSelectedUserId: (userId) => set({ selectedUserId: userId }),
  
  setLastTeamId: (teamId) => set({ lastTeamId: teamId }),
  
  setLastMessageSenderId: (userId) => set({ lastMessageSenderId: userId }),
  
  setUnreadMessageCount: (userId, count) => 
    set((state) => ({
      unreadMessagesByUser: {
        ...state.unreadMessagesByUser,
        [userId]: count,
      },
    })),
  
  clearUnreadMessages: (userId) =>
    set((state) => {
      const { [userId]: _, ...rest } = state.unreadMessagesByUser;
      return { unreadMessagesByUser: rest };
    }),
  
  // Helper function to handle opening chat with specific user
  openChatWithUser: (userId, teamId) =>
    set({
      isOpen: true,
      selectedUserId: userId,
      lastTeamId: teamId,
      lastMessageSenderId: userId,
    }),
}));

