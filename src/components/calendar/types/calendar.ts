
export interface BaseEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  color: string;
  meeting_type: string;
  completed: boolean;
  cancelled: boolean;
  user_id: string;
  lead_id: string;
  leads: { name: string };
  isTeamEvent: boolean;
  due_date: string;
  description: string;
}

export interface Appointment extends BaseEvent {
  isTeamEvent: false;
}

export interface TeamEvent extends BaseEvent {
  isTeamEvent: true;
  is_admin_only: boolean;
  is_90_day_run: boolean;
  recurring_pattern: string;
  recurring_day_of_week: number | null;
  team_id: string;
  created_by: string;
}

export type CalendarEvent = Appointment | TeamEvent;
