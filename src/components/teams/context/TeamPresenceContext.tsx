
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OnlineMember {
  user_id: string;
  online_at: string;
}

interface TeamPresenceContextType {
  onlineMembers: OnlineMember[];
  isOnline: (userId: string) => boolean;
}

const TeamPresenceContext = createContext<TeamPresenceContextType>({
  onlineMembers: [],
  isOnline: () => false,
});

export const useTeamPresence = () => useContext(TeamPresenceContext);

export const TeamPresenceProvider = ({ 
  teamId, 
  children 
}: { 
  teamId: string;
  children: React.ReactNode;
}) => {
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([]);

  useEffect(() => {
    // Funktion zum Aktualisieren des Online-Status
    const updateOnlineStatus = async (userId: string, isOnline: boolean) => {
      await supabase
        .from('profiles')
        .update({ 
          status: isOnline ? 'online' : 'offline',
          last_seen: new Date().toISOString()
        })
        .eq('id', userId);
    };

    const channel = supabase.channel(`team_${teamId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online: OnlineMember[] = [];
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            online.push(presence);
          });
        });
        
        setOnlineMembers(online);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        newPresences.forEach(presence => {
          updateOnlineStatus(presence.user_id, true);
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        leftPresences.forEach(presence => {
          updateOnlineStatus(presence.user_id, false);
        });
      });

    // Subscribe zum Channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await channel.track({
            user_id: session.user.id,
            online_at: new Date().toISOString(),
          });
        }
      }
    });

    // Cleanup wenn die Komponente unmounted
    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  const isOnline = (userId: string) => {
    return onlineMembers.some(member => member.user_id === userId);
  };

  return (
    <TeamPresenceContext.Provider value={{ onlineMembers, isOnline }}>
      {children}
    </TeamPresenceContext.Provider>
  );
};
