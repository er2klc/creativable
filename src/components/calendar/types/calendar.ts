export interface Appointment {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  end_date?: string;
  color: string;
  meeting_type: string;
  completed: boolean;
  cancelled: boolean;
  user_id: string;
  lead_id: string;
  leads: { name: string };
  isTeamEvent: boolean;
  is_multi_day?: boolean;
  due_date?: string;
  current_day?: string;
}

export interface AppointmentToEdit {
  id: string;
  leadId: string;
  time: string;
  title: string;
  color: string;
  meeting_type: string;
  completed?: boolean;
  cancelled?: boolean;
}

export interface AppointmentWithEndDate extends Appointment {
  end_date?: string;
}

export type RecurringPattern = 'none' | 'daily' | 'weekly' | 'monthly';

export interface TeamEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  end_date?: string;
  color: string;
  is_team_event: boolean;
  is_admin_only: boolean;
  is_multi_day: boolean;
  recurring_pattern: RecurringPattern;
  recurring_day_of_week?: number;
  created_by: string;
  created_at: string;
  isTeamEvent: boolean;
  isRecurring: boolean;
}