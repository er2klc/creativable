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
  description?: string;
  created_by?: string;
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

export interface TeamEvent extends Appointment {
  description?: string;
  is_admin_only: boolean;
  is_90_day_run: boolean;
  recurring_pattern: string;
  recurring_day_of_week?: number;
  team_id: string;
  isRecurring?: boolean;
}