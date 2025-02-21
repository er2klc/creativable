
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { toast } from "sonner";
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
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedMember, setSelectedMember] = useState<{id: string; name: string; teamId: string} | null>(null);
  const [showSearch, setShowSearch] = useState(false);

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

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team-members', team?.id, debouncedSearch],
    queryFn: async () => {
      if (!team?.id) return [];

      const query = supabase
        .from('team_members')
        .select(`
          id,
          role,
          team_id,
          joined_at,
          user_id,
          profile:user_id(
            id,
            avatar_url,
            display_name,
            email,
            bio,
            slug
          ),
          points:team_member_points(
            level,
            points
          )
        `)
        .eq('team_id', team.id);

      if (debouncedSearch) {
        query.or(`profile.display_name.ilike.%${debouncedSearch}%,profile.email.ilike.%${debouncedSearch}%`);
      }

      const { data, error } = await query.order('joined_at', { ascending: false });

      if (error) {
        console.error('Error fetching members:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!team?.id
  });

  const { data: currentMember } = useQuery({
    queryKey: ['current-member', team?.id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*, points:team_member_points(level, points)')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!team?.id && !!user?.id
  });

  const handleAwardPoints = async () => {
    await queryClient.invalidateQueries({ queryKey: ['team-members'] });
    toast.success("Punkte wurden erfolgreich vergeben!");
  };

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
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            {showSearch ? (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Mitglieder suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                  autoFocus
                  onBlur={() => {
                    if (!searchQuery) {
                      setShowSearch(false);
                    }
                  }}
                />
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-4 w-4 mr-2" />
                Suchen
              </Button>
            )}
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Lade Mitglieder...
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    {debouncedSearch ? 'Keine Mitglieder gefunden.' : 'Keine Mitglieder vorhanden.'}
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
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
                        {showSearch && (
                          <div className="text-sm text-muted-foreground">{member.profile?.email}</div>
                        )}
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
                      {member.points?.[0]?.level || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      {member.points?.[0]?.points || 0}
                    </TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))
              )}
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
            onSuccess={handleAwardPoints}
          />
        )}
      </div>
    </div>
  );
};

export default MemberManagement;
