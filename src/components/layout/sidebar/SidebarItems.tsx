import { 
  LayoutGrid, 
  Users, 
  MessageSquare, 
  Calendar,
  CheckSquare,
  BarChart, 
  Settings,
  FileText,
  Shield,
  Globe2,
  Infinity,
  GraduationCap,
  Database,
  Wrench
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";

const useTaskCount = () => {
  return useQuery({
    queryKey: ['task-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completed', false);

      return count || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

const useAppointmentCount = () => {
  return useQuery({
    queryKey: ['todays-appointments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const today = new Date();
      const startTime = startOfDay(today).toISOString();
      const endTime = endOfDay(today).toISOString();

      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('due_date', startTime)
        .lte('due_date', endTime)
        .eq('completed', false)
        .eq('cancelled', false);

      return count || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const personalItems = () => {
  const { data: taskCount = 0 } = useTaskCount();
  const { data: appointmentCount = 0 } = useAppointmentCount();

  return [
    { title: "Dashboard", icon: LayoutGrid, url: "/dashboard" },
    { title: "Kontakte", icon: Users, url: "/leads" },
    { 
      title: "Nachrichten", 
      icon: MessageSquare, 
      url: "/messages",
      badge: true 
    },
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
  ];
};

export const teamItems = [
  { title: "Unity", icon: Infinity, url: "/unity" },
  { title: "Elevate", icon: GraduationCap, url: "/elevate" },
];

export const analysisItems = [
  { title: "Berichte", icon: BarChart, url: "/reports" },
  { title: "Tools", icon: Wrench, url: "/tools" },
  { title: "Einstellungen", icon: Settings, url: "/settings" },
];

export const legalItems = [
  { title: "Impressum", icon: FileText, url: "/impressum" },
  { title: "Datenschutz", icon: Shield, url: "/privacy-policy" },
  { title: "Datenlöschung", icon: Globe2, url: "/auth/data-deletion/instagram" },
];

export const adminItems = [
  { title: "Admin Dashboard", icon: Database, url: "/admin" },
];