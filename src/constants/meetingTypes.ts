import { LucideIcon } from "lucide-react";

export type MeetingType = {
  value: string;
  label: string;
  iconName: string;
};

export const MEETING_TYPES: MeetingType[] = [
  { value: "phone_call", label: "Telefongespräch", iconName: "Phone" },
  { value: "on_site", label: "Vor-Ort-Termin", iconName: "MapPin" },
  { value: "zoom", label: "Zoom Meeting", iconName: "Video" },
  { value: "initial_meeting", label: "Erstgespräch", iconName: "Users" },
  { value: "presentation", label: "Präsentation", iconName: "BarChart" },
  { value: "follow_up", label: "Folgetermin", iconName: "RefreshCw" }
] as const;