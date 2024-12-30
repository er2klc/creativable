export interface Team {
  id: string;
  name: string;
  description: string | null;
  created_at: string | null;
  created_by: string;
  max_members: number | null;
  join_code: string | null;
  logo_url: string | null;
  slug: string;
  order_index?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string | null;
  invited_by: string | null;
}

export interface TeamInvite {
  id: string;
  team_id: string;
  email: string;
  invited_by: string;
  created_at: string | null;
  expires_at: string | null;
  status: string | null;
}

export type TeamInsert = Omit<Team, 'id' | 'created_at'>;
export type TeamUpdate = Partial<TeamInsert>;

export type TeamMemberInsert = Omit<TeamMember, 'id' | 'joined_at'>;
export type TeamMemberUpdate = Partial<Omit<TeamMember, 'id'>>;

export type TeamInviteInsert = Omit<TeamInvite, 'id' | 'created_at' | 'expires_at'>;
export type TeamInviteUpdate = Partial<Omit<TeamInvite, 'id'>>;