export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string | null;
}