export interface TeamEvent {
  id: string;
  team_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  created_by: string | null;
  created_at: string | null;
  color: string | null;
  recurring_pattern: string | null;
  recurring_day_of_week: number | null;
  is_team_event: boolean | null;
  is_admin_only: boolean | null;
  end_date: string | null;
  is_multi_day: boolean | null;
  is_90_day_run: boolean | null;
}