
import { LayoutGrid, Users, Calendar, CheckSquare, Mail, Waves, Link2 } from "lucide-react";
import { useTaskCount } from "../hooks/useTaskCount";
import { useAppointmentCount } from "../hooks/useAppointmentCount";
import { useElevateProgress } from "../hooks/useElevateProgress";
import { useUnreadCount } from "../hooks/useUnreadCount";

export const usePersonalItems = () => {
  const taskCount = useTaskCount();
  const appointmentCount = useAppointmentCount();
  const { data: elevateProgress = 0 } = useElevateProgress();
  const unreadCount = useUnreadCount();

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
      title: "E-Mail",
      icon: Mail,
      url: "/messages",
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    {
      title: "Links",
      icon: Link2,
      url: "/links"
    },
  ];
};
