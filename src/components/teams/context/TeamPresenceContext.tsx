
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
    const updateOnlineStatus = async (userId: string, isOnline: boolean) => {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (error) {
          console.error('Error updating status:', error);
        }
      } catch (err) {
        console.error('Error updating online status:', err);
      }
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

    return () => {
      channel.unsubscribe();
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
