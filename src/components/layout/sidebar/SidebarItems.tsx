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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";
import { useUser } from "@supabase/auth-helpers-react";
import { useEffect } from "react";

export const useTaskCount = () => {
  const queryClient = useQueryClient();

  const { data: taskCount = 0 } = useQuery({
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
    refetchInterval: 30000,
  });

  // Subscribe to real-time updates for tasks
  useEffect(() => {
    const channel = supabase
      .channel('task-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['task-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return taskCount;
};

export const useAppointmentCount = () => {
  const queryClient = useQueryClient();
  const user = useUser();

  const { data: appointmentCount = 0 } = useQuery({
    queryKey: ['todays-appointments'],
    queryFn: async () => {
      if (!user?.id) return 0;

      const today = new Date();
      const startTime = startOfDay(today).toISOString();
      const endTime = endOfDay(today).toISOString();

      // Get personal appointments
      const { count: personalCount = 0 } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('due_date', startTime)
        .lt('due_date', endTime)
        .eq('completed', false)
        .eq('cancelled', false);

      // Get team memberships
      const { data: teamMemberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      const teamIds = teamMemberships?.map(tm => tm.team_id) || [];

      if (teamIds.length === 0) return personalCount;

      // Get team appointments with fixed query syntax
      const { count: teamCount = 0 } = await supabase
        .from('team_calendar_events')
        .select('*', { count: 'exact', head: true })
        .in('team_id', teamIds)
        .gte('start_time', startTime)
        .lt('end_time', endTime)
        .eq('cancelled', false);

      return personalCount + teamCount;
    },
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000,
  });

  // Subscribe to real-time updates for appointments and team events
  useEffect(() => {
    const channels = [
      supabase
        .channel('appointment-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks'
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['todays-appointments'] });
          }
        )
        .subscribe(),

      supabase
        .channel('team-event-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'team_calendar_events'
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['todays-appointments'] });
          }
        )
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient]);

  return appointmentCount;
};

export const useElevateProgress = () => {
  const user = useUser();

  return useQuery({
    queryKey: ['elevate-total-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      // Get all platforms the user has access to
      const { data: platforms } = await supabase
        .from('elevate_platforms')
        .select(`
          id,
          elevate_modules!elevate_modules_platform_id_fkey (
            id,
            elevate_lerninhalte!elevate_lerninhalte_module_id_fkey (
              id
            )
          )
        `);

      if (!platforms) return 0;

      // Flatten all lerninhalte IDs
      const lerninhalteIds = platforms.flatMap(platform => 
        platform.elevate_modules?.flatMap(module => 
          module.elevate_lerninhalte?.map(item => item.id)
        ) || []
      );

      if (lerninhalteIds.length === 0) return 0;

      // Get completed lerninhalte count
      const { data: completedLerninhalte } = await supabase
        .from('elevate_user_progress')
        .select('lerninhalte_id')
        .eq('user_id', user.id)
        .eq('completed', true)
        .in('lerninhalte_id', lerninhalteIds);

      // Calculate total progress
      const totalUnits = lerninhalteIds.length;
      const completedUnits = completedLerninhalte?.length || 0;
      return totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;
    },
    enabled: !!user?.id,
  });
};

export const teamItems = [
  { title: "Unity", icon: Infinity, url: "/unity" },
  { 
    title: "Elevate", 
    icon: GraduationCap, 
    url: "/elevate",
    showProgress: true 
  },
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

export const usePersonalItems = () => {
  const taskCount = useTaskCount();
  const appointmentCount = useAppointmentCount();
  const { data: elevateProgress = 0 } = useElevateProgress();

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
