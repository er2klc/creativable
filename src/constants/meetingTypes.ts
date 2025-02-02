import { Phone, MapPin, Video, Users, BarChart, RefreshCw } from "lucide-react";

export const MEETING_TYPES = [
  { value: "phone_call", label: "Telefongespräch", icon: <Phone className="h-4 w-4" /> },
  { value: "on_site", label: "Vor-Ort-Termin", icon: <MapPin className="h-4 w-4" /> },
  { value: "zoom", label: "Zoom Meeting", icon: <Video className="h-4 w-4" /> },
  { value: "initial_meeting", label: "Erstgespräch", icon: <Users className="h-4 w-4" /> },
  { value: "presentation", label: "Präsentation", icon: <BarChart className="h-4 w-4" /> },
  { value: "follow_up", label: "Folgetermin", icon: <RefreshCw className="h-4 w-4" /> }
] as const;
