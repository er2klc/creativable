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
  created_at: string;
  user_id: string;
  lead_id?: string;
  leads: { name: string };
  start_time: string;
  end_time?: string;
  recurring_pattern?: string;
  recurring_day_of_week?: number;
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
  lead_id?: string;
  leads: { name: string };
  isTeamEvent: boolean;
  onComplete?: (completed: boolean) => void;
}

export interface AppointmentToEdit {
  id: string;
  lead_id: string;
  time: string;
  title: string;
  color: string;
  meeting_type: string;
}