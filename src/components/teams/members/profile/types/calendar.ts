
export interface DayActivity {
  date: Date;
  posts: number;
  comments: number;
  likes: number;
  total: number;
}

export interface ActivityCalendarProps {
  activities: {
    id: string;
    type: 'post' | 'comment';
    created_at: string;
    reactions_count?: number;
  }[];
}
