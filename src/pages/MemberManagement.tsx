
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { MemberCard } from "@/components/teams/members/MemberCard";
import { useUser } from "@supabase/auth-helpers-react";
import { Users } from "lucide-react";
import { TeamMemberSearch } from "@/components/teams/search/TeamMemberSearch";
import { useState, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";

const MemberManagement = () => {
  const { teamSlug } = useParams();
  const user = useUser();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

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
            slug,
            last_seen
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

  const currentUserLevel = currentMember?.points?.level || 0;
  const isAdmin = currentMember?.role === 'admin' || currentMember?.role === 'owner';

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
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
            <div className="w-[300px]">
              <TeamMemberSearch onSearch={handleSearch} />
            </div>
            <HeaderActions profile={null} userEmail={user?.email} />
          </div>
        </div>
      </div>

      <div className="container py-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {members.map((member) => (
            <MemberCard 
              key={member.id} 
              member={member}
              currentUserLevel={currentUserLevel}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberManagement;
