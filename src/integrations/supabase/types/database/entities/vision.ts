export interface VisionBoard {
  id: string;
  user_id: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VisionBoardImage {
  id: string;
  board_id: string;
  theme: string;
  image_url: string;
  created_at?: string | null;
  order_index: number;
}