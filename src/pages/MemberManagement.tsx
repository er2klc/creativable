
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useUser } from "@supabase/auth-helpers-react";
import { Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { AwardPointsDialog } from "@/components/teams/members/AwardPointsDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MemberManagement = () => {
  const { teamSlug } = useParams();
  const user = useUser();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedMember, setSelectedMember] = useState<{id: string; name: string; teamId: string} | null>(null);

  const { data: team } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('slug', teamSlug)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!teamSlug
  });

  const { data: members = [] } = useQuery({
    queryKey: ['team-members', team?.id, debouncedSearch],
    queryFn: async () => {
      let query = supabase
        .from('team_members')
        .select(`
          *,
          profile:user_id(
            id,
            avatar_url,
            display_name,
            email,
            bio,
            slug
          ),
          points:team_member_points!inner(
            level,
            points
          )
        `)
        .eq('team_id', team.id);

      if (debouncedSearch) {
        query = query.or(`profile.display_name.ilike.%${debouncedSearch}%,profile.email.ilike.%${debouncedSearch}%`);
      }

      const { data, error } = await query.order('joined_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!team?.id
  });

  const { data: currentMember } = useQuery({
    queryKey: ['current-member', team?.id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*, points:team_member_points!inner(level, points)')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!team?.id && !!user?.id
  });

  const isAdmin = currentMember?.role === 'admin' || currentMember?.role === 'owner';

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <div className="text-center text-muted-foreground">
          Sie haben keine Berechtigung, diese Seite zu sehen.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
        <div className="h-16 px-4 flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                onClick={() => navigate(`/unity/${teamSlug}`)}
              >
                {team?.name}
              </div>
              <span className="text-muted-foreground">/</span>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Mitgliederverwaltung</span>
              </div>
            </div>
            <HeaderActions profile={null} userEmail={user?.email} />
          </div>
        </div>
      </div>

      <div className="container py-8 mt-16">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Mitglieder suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 max-w-md"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mitglied</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead className="text-right">Level</TableHead>
                <TableHead className="text-right">Punkte</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.profile?.avatar_url} />
                      <AvatarFallback>
                        {member.profile?.display_name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.profile?.display_name}</div>
                      <div className="text-sm text-muted-foreground">{member.profile?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={member.role === 'owner' ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {member.points?.level || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.points?.points || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.role !== 'owner' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMember({
                          id: member.id,
                          name: member.profile?.display_name || "Unbekannt",
                          teamId: member.team_id
                        })}
                      >
                        <Award className="h-4 w-4 mr-2" />
                        Punkte vergeben
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {selectedMember && (
          <AwardPointsDialog
            isOpen={!!selectedMember}
            onClose={() => setSelectedMember(null)}
            memberId={selectedMember.id}
            memberName={selectedMember.name}
            teamId={selectedMember.teamId}
          />
        )}
      </div>
    </div>
  );
};

export default MemberManagement;
