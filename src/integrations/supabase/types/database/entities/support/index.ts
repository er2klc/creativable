import { Json } from '../base/json';

export interface SupportTicket {
  id: string;
  user_id?: string;
  email: string;
  subject: string;
  message: string;
  status?: string;
  priority?: string;
  created_at?: string;
  updated_at?: string;
  is_visitor?: boolean;
}