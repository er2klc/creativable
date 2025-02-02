export interface UserSignature {
  id: string;
  user_id: string;
  name: string;
  template: string;
  created_at?: string | null;
  updated_at?: string | null;
}