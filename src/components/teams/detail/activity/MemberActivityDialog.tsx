import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Trophy } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface MemberActivityDialogProps {
  userId: string | null;
  teamId: string;
  onClose: () => void;
}

export const MemberActivityDialog = ({ userId, teamId, onClose }: MemberActivityDialogProps) => {
  const { data: profile } = useQuery({
    queryKey: ['member-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    },
    enabled: !!userId,
  });

  const { data: points } = useQuery({
    queryKey: ['member-points', userId, teamId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('team_member_points')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching points:', error);
        return null;
      }

      return data;
    },
    enabled: !!userId && !!teamId,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['member-activities', userId, teamId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data: events, error } = await supabase
        .from('team_point_events')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching activities:', error);
        return [];
      }

      return events;
    },
    enabled: !!userId && !!teamId,
  });

  if (!userId || !profile) return null;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create_post':
        return <MessageSquare className="h-4 w-4" />;
      case 'create_comment':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const getActivityText = (type: string) => {
    switch (type) {
      case 'create_post':
        return 'hat einen Beitrag erstellt';
      case 'create_comment':
        return 'hat einen Kommentar geschrieben';
      default:
        return 'hat Punkte erhalten';
    }
  };

  return (
    <Dialog open={!!userId} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback>
                {profile.display_name?.substring(0, 2).toUpperCase() || '??'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span>{profile.display_name}</span>
              <span className="text-sm font-normal text-muted-foreground">
                Level {points?.level} • {points?.points} Punkte
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-4 h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50"
              >
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                  {getActivityIcon(activity.event_type)}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm">
                    {getActivityText(activity.event_type)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(activity.created_at), 'PPp', { locale: de })}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    // TODO: Implement navigation to the specific content
                    console.log('Navigate to:', activity.metadata);
                  }}
                >
                  Anzeigen
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};