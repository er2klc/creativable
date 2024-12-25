export interface Message {
  id: string;
  user_id: string;
  lead_id: string | null;
  platform: string;
  content: string;
  sent_at: string | null;
  read: boolean;
}

export interface MessageInsert {
  id?: string;
  user_id: string;
  lead_id?: string | null;
  platform: string;
  content: string;
  sent_at?: string | null;
  read?: boolean;
}

export interface MessageUpdate {
  id?: string;
  user_id?: string;
  lead_id?: string | null;
  platform?: string;
  content?: string;
  sent_at?: string | null;
  read?: boolean;
}