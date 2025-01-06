export type RecurringPattern = 'none' | 'daily' | 'weekly' | 'monthly';

export interface TeamCalendarEvent {
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
}

export interface TeamEvent extends TeamCalendarEvent {
  isRecurring: boolean;
}