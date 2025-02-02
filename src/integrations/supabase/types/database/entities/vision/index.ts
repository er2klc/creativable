export interface VisionBoard {
  id: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface VisionBoardImage {
  id: string;
  board_id: string;
  theme: string;
  image_url: string;
  created_at?: string;
  order_index: number;
}