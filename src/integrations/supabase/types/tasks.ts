import { Json } from './json';

export interface Task {
  id: string;
  user_id: string;
  lead_id: string | null;
  title: string;
  completed: boolean | null;
  due_date: string | null;
  created_at: string | null;
  color: string | null;
  meeting_type: string | null;
  cancelled: boolean | null;
  priority: string | null;
  order_index: number | null;
  updated_at: string | null;
}