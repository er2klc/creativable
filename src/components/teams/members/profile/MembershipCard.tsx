
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

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
            <div>
              <h4 className="font-medium">{membership.teams.name}</h4>
              <p className="text-sm text-muted-foreground">
                Beigetreten {formatDistanceToNow(new Date(membership.joined_at), { 
                  addSuffix: true,
                  locale: de 
                })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
