
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type MemberRow = Pick<Tables<"team_members">, "id"|"team_id"|"user_id"|"role">;
type ProfileRow = Pick<Tables<"profiles">, "id"|"display_name"|"avatar_url"|"email">;

type TeamMemberVM = {
  id: string;
  team_id: string;
  user_id: string;
  role: string | null;
  display_name: string | null;
  avatar_url: string | null;
  last_seen: string | null;
  email: string | null;
  points?: number;
};

export function useTeamMembers(teamId: string | null, currentUserId?: string) {
  const result = useQuery<TeamMemberVM[], Error>({
    queryKey: ["team-members", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      // 1) Roh-Mitglieder
      const { data: members, error: memErr } = await supabase
        .from("team_members")
        .select("id,team_id,user_id,role")
        .eq("team_id", teamId!);
      if (memErr) throw memErr;
      const ms = (members ?? []) as MemberRow[];

      if (ms.length === 0) return [];

      // 2) zugehörige Profile
      const userIds = Array.from(new Set(ms.map(m => m.user_id)));
      const { data: profiles, error: profErr } = await supabase
        .from("profiles")
        .select("id,display_name,avatar_url,email")
        .in("id", userIds);

      if (profErr) throw profErr;
      const profMap = new Map<string, ProfileRow>(
        (profiles ?? []).map(p => [p.id, p as ProfileRow])
      );

      // 3) optional: Punkte (wenn Tabelle existiert; sonst try/catch ignorieren)
      let ptsMap = new Map<string, number>();
      try {
        const { data: pts } = await supabase
          .from("team_member_points" as any)
          .select("user_id,team_id,points")
          .eq("team_id", teamId!);
        ptsMap = new Map<string, number>(
          ((pts as any[]) ?? []).map((p: any) => [p.user_id, p.points])
        );
      } catch {
        // Tabelle (noch) nicht typisiert → ignorieren
      }

      // 4) ViewModel bauen
      const result: TeamMemberVM[] = ms
        .filter(m => m.user_id !== currentUserId)
        .map(m => {
          const p = profMap.get(m.user_id);
          return {
            id: m.id,
            team_id: m.team_id,
            user_id: m.user_id,
            role: m.role,
            display_name: p?.display_name ?? null,
            avatar_url: p?.avatar_url ?? null,
            last_seen: null, // simplified since last_seen doesn't exist in profiles
            email: p?.email ?? null,
            points: ptsMap.get(m.user_id),
          };
        });

      return result;
    },
  });

  return { teamMembers: result.data ?? [], isLoading: result.isLoading };
}

