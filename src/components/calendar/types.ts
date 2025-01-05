export interface Appointment {
  id: string;
  title: string;
  due_date: string;
  color: string;
  meeting_type: string;
  completed: boolean;
  cancelled: boolean;
  created_at: string;
  user_id: string;
  lead_id: string | null;
  leads?: { name: string };
  isTeamEvent?: boolean;
  isAdminEvent?: boolean;
  isRecurring?: boolean;
  start_time?: string;
  end_time?: string;
  teams?: { name: string };
  recurring_pattern?: string;
  recurring_day_of_week?: number;
  onComplete?: (completed: boolean) => void;
  onCancel?: (cancelled: boolean) => void;
}