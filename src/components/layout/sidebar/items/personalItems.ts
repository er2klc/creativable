import { LayoutGrid, Users, Calendar, CheckSquare, MessageSquare, Waves, Link2, FileText } from "lucide-react";
import { useTaskCount } from "../hooks/useTaskCount";
import { useAppointmentCount } from "../hooks/useAppointmentCount";
import { useElevateProgress } from "../hooks/useElevateProgress";

export const usePersonalItems = () => {
  const taskCount = useTaskCount();
  const appointmentCount = useAppointmentCount();
  const { data: elevateProgress = 0 } = useElevateProgress();

  return [
    { title: "Dashboard", icon: LayoutGrid, url: "/dashboard" },
    { title: "Kontakte", icon: Users, url: "/contacts" },
    { title: "Pool", icon: Waves, url: "/pool" },
    { 
      title: "Kalender", 
      icon: Calendar, 
      url: "/calendar",
      badge: appointmentCount || undefined
    },
    { 
      title: "Todo Liste", 
      icon: CheckSquare, 
      url: "/todo",
      badge: taskCount > 0 ? taskCount : undefined
    },
    {
      title: "Nachrichten",
      icon: MessageSquare,
      url: "/messages"
    },
    {
      title: "Links",
      icon: Link2,
      url: "/links"
    },
    {
      title: "Changelog",
      icon: FileText,
      url: "/changelog"
    },
  ];
};