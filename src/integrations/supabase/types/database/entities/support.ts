export interface SupportTicket {
  id: string;
  user_id?: string | null;
  email: string;
  subject: string;
  message: string;
  status?: string | null;
  priority?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_visitor?: boolean | null;
}