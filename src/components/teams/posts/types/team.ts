
export interface TeamCategory {
  id: string;
  name: string;
  slug: string;
  team_id: string;
  order_index: number;
  icon?: string;
  color?: string;
  is_public?: boolean;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
}
