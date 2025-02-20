
import { createContext, useContext } from 'react';

export interface TeamMemberData {
  id: string;
  role: 'owner' | 'admin' | 'member';
  user_id: string;
  profile: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    status: string;
    last_seen: string | null;
    slug: string | null;
  };
  points: {
    level: number;
    points: number;
  };
}

interface TeamDataContextValue {
  members: TeamMemberData[];
  isLoading: boolean;
  lastUpdated: Date | null;
}

export const TeamDataContext = createContext<TeamDataContextValue>({
  members: [],
  isLoading: false,
  lastUpdated: null
});

export const useTeamDataContext = () => {
  const context = useContext(TeamDataContext);
  if (!context) {
    throw new Error('useTeamDataContext must be used within a TeamDataProvider');
  }
  return context;
};
