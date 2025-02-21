
export interface TeamMember {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  last_seen?: string | null;
  email?: string | null;
  level: number;  // Hinzugefügt
}

export interface TeamMessage {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read: boolean;
  sender?: TeamMember;
  receiver?: TeamMember;
}
