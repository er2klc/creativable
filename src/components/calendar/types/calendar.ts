export interface TeamEvent {
  id: string;
  title: string;
  due_date: string;
  color: string;
  isTeamEvent: boolean;
  isAdminEvent: boolean;
  isRecurring: boolean;
  meeting_type: string;
  completed: boolean;
  cancelled: boolean;
  leads: { name: string };
  start_time: string;
  end_time?: string;
  recurring_pattern?: string;
  recurring_day_of_week?: number;
  is_multi_day?: boolean;
  end_date?: string;
  is_90_day_run?: boolean;
  user_id: string;
  lead_id?: string;
}

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
  lead_id: string;
  leads: { name: string };
  isTeamEvent: boolean;
  onComplete?: (completed: boolean) => void;
  start_time?: string;
  end_time?: string;
  is_multi_day?: boolean;
  end_date?: string;
  is_90_day_run?: boolean;
}

export interface AppointmentToEdit {
  id: string;
  leadId: string;  // Keep this as leadId to match the expected props type
  time: string;
  title: string;
  color: string;
  meeting_type: string;
}