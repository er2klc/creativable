import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";

export type Note = Tables<"notes">;
export type Message = Tables<"messages">;
export type Task = Tables<"tasks">;
export type LeadFile = Tables<"lead_files">;

export interface LeadWithRelations extends Omit<Tables<"leads">, "notes"> {
  platform: Platform;
  messages: Message[];
  tasks: Task[];
  notes: Note[];
  lead_files: LeadFile[];
}