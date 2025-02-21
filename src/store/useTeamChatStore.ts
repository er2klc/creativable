
import { create } from "zustand";

interface TeamChatStore {
  isOpen: boolean;
  selectedUserId: string | null;
  setOpen: (isOpen: boolean) => void;
  setSelectedUserId: (userId: string | null) => void;
}

export const useTeamChatStore = create<TeamChatStore>((set) => ({
  isOpen: false,
  selectedUserId: null,
  setOpen: (isOpen) => set({ isOpen }),
  setSelectedUserId: (userId) => {
    set({ selectedUserId: userId });
    if (userId) {
      set({ isOpen: true }); // Automatisch den Chat öffnen wenn ein Benutzer ausgewählt wird
    }
  },
}));
