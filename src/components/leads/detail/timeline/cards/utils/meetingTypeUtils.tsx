
import * as React from "react";
import { Phone, MapPin, Video, Users, BarChart, RefreshCw, Calendar } from "lucide-react";

export const getMeetingTypeLabel = (type: string): string => {
  switch (type) {
    case "phone_call":
      return "Telefongespräch";
    case "on_site":
      return "Vor-Ort-Termin";
    case "zoom":
      return "Zoom Meeting";
    case "initial_meeting":
      return "Erstgespräch";
    case "presentation":
      return "Präsentation";
    case "follow_up":
      return "Folgetermin";
    default:
      return type;
  }
};

export const getMeetingTypeIcon = (type: string) => {
  switch (type) {
    case "phone_call":
      return <Phone className="h-4 w-4 text-blue-500" />;
    case "on_site":
      return <MapPin className="h-4 w-4 text-blue-500" />;
    case "zoom":
      return <Video className="h-4 w-4 text-blue-500" />;
    case "initial_meeting":
      return <Users className="h-4 w-4 text-blue-500" />;
    case "presentation":
      return <BarChart className="h-4 w-4 text-blue-500" />;
    case "follow_up":
      return <RefreshCw className="h-4 w-4 text-blue-500" />;
    default:
      return <Calendar className="h-4 w-4 text-blue-500" />;
  }
};

