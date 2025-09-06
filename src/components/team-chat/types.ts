
export interface TeamMember {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  last_seen?: string | null;
  email?: string | null;
  level: number;
}

export interface TeamMessage {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  team_id: string;
  created_at: string;
  read: boolean;
  read_at: string | null;
  delivered_at: string | null;
  sender?: TeamMember;
  receiver?: TeamMember;
}
