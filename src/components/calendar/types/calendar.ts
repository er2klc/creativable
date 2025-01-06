export interface Appointment {
  id: string;
  title: string;
  start_time: string;
  end_time?: string;
  end_date?: string;
  color?: string;
  isTeamEvent?: boolean;
  is_multi_day?: boolean;
  isRecurring?: boolean;
  is_admin_only?: boolean;
  completed?: boolean;
  cancelled?: boolean;
  meeting_type?: string;
  leads?: {
    name: string;
  };
  current_day?: string;
  due_date?: string;
  lead_id?: string;
}

export interface TeamEvent extends Appointment {
  isTeamEvent: true;
  team_id: string;
  teams?: {
    name: string;
  };
}

export interface AppointmentToEdit {
  id: string;
  leadId: string;
  time: string;
  title: string;
  color: string;
  meeting_type: string;
}

export interface AppointmentWithEndDate extends Appointment {
  end_date?: string;
}

export type RecurringPattern = 'none' | 'daily' | 'weekly' | 'monthly';