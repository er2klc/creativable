
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Users } from "lucide-react";

interface MembershipCardProps {
  userId: string;
}

export const MembershipCard = ({ userId }: MembershipCardProps) => {
  const { data: teams } = useQuery({
    queryKey: ['user-teams', userId],
    queryFn: async () => {
      const { data: teamMembers, error } = await supabase
        .from('team_members')
        .select(`
          joined_at,
          teams:team_id (
            id,
            name,
            logo_url,
            slug
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return teamMembers;
    }
  });

  // Neue Query für die Mitgliederanzahl pro Team
  const { data: memberCounts } = useQuery({
    queryKey: ['team-member-counts', teams?.map(t => t.teams.id)],
    queryFn: async () => {
      if (!teams?.length) return {};
      
      const { data, error } = await supabase
        .from('team_members')
        .select('team_id, count', { count: 'exact', head: true })
        .in('team_id', teams.map(t => t.teams.id));

      if (error) throw error;

      const counts: Record<string, number> = {};
      for (const team of teams) {
        const { count } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', team.teams.id);
        counts[team.teams.id] = count || 0;
      }
      
      return counts;
    },
    enabled: !!teams?.length
  });

  if (!teams?.length) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold">Memberships</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {teams.map((membership) => (
          <div key={membership.teams.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={membership.teams.logo_url} alt={membership.teams.name} />
              <AvatarFallback>{membership.teams.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-medium">{membership.teams.name}</h4>
              <p className="text-sm text-muted-foreground">
                Beigetreten {formatDistanceToNow(new Date(membership.joined_at), { 
                  addSuffix: true,
                  locale: de 
                })}
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{memberCounts?.[membership.teams.id] || 0}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
