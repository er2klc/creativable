import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useSettings } from "@/hooks/use-settings";
import { Progress } from "@/components/ui/progress";
import { Users, CheckSquare, Calendar, Star, AlertTriangle, Flag } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import { Instagram, Linkedin, Facebook, Video } from "lucide-react";
const platformIcons = {
  "Instagram": Instagram,
  "LinkedIn": Linkedin,
  "Facebook": Facebook,
  "TikTok": Video,
  "Offline": Users
};
const priorityIcons = {
  "High": <Star className="h-4 w-4 text-yellow-500" />,
  "Medium": <Flag className="h-4 w-4 text-blue-500" />,
  "Low": <AlertTriangle className="h-4 w-4 text-gray-500" />
};
export const DashboardMetrics = () => {
  const session = useSession();
  const {
    settings
  } = useSettings();

  // Get contacts by platform
  const {
    data: contactsByPlatform = []
  } = useQuery({
    queryKey: ["contacts-by-platform"],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const {
        data,
        error
      } = await supabase.from("leads").select("platform, status").eq("user_id", session.user.id);
      if (error) {
        console.error("Error fetching contacts:", error);
        return [];
      }
      const platforms = data.reduce((acc, curr) => {
        acc[curr.platform] = (acc[curr.platform] || 0) + 1;
        return acc;
      }, {});
      const statuses = data.reduce((acc, curr) => {
        acc[curr.status || 'lead'] = (acc[curr.status || 'lead'] || 0) + 1;
        return acc;
      }, {});
      return {
        platforms: Object.entries(platforms).map(([platform, count]) => ({
          platform,
          count
        })),
        statuses
      };
    },
    enabled: !!session?.user?.id
  });

  // Get task completion stats and high priority tasks
  const {
    data: taskStats = {
      total: 0,
      completed: 0,
      highPriorityTasks: []
    }
  } = useQuery({
    queryKey: ["task-stats"],
    queryFn: async () => {
      if (!session?.user?.id) return {
        total: 0,
        completed: 0,
        highPriorityTasks: []
      };
      const {
        data,
        error
      } = await supabase.from("tasks").select("*, leads(name)").eq("user_id", session.user.id).eq("completed", false).order("due_date", {
        ascending: true
      });
      if (error) {
        console.error("Error fetching tasks:", error);
        return {
          total: 0,
          completed: 0,
          highPriorityTasks: []
        };
      }
      const highPriorityTasks = data.filter(task => task.priority === "High").slice(0, 3);
      const {
        data: completedData
      } = await supabase.from("tasks").select("id").eq("user_id", session.user.id).eq("completed", true);
      const total = (data?.length || 0) + (completedData?.length || 0);
      const completed = completedData?.length || 0;
      return {
        total,
        completed,
        highPriorityTasks
      };
    },
    enabled: !!session?.user?.id
  });

  // Get upcoming appointments
  const {
    data: upcomingAppointments = []
  } = useQuery({
    queryKey: ["upcoming-appointments"],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const {
        data,
        error
      } = await supabase.from("tasks").select("*, leads(name)").eq("user_id", session.user.id).not("due_date", "is", null).order("due_date", {
        ascending: true
      });
      if (error) {
        console.error("Error fetching appointments:", error);
        return [];
      }
      return data.filter(task => isToday(new Date(task.due_date)) || isTomorrow(new Date(task.due_date)));
    },
    enabled: !!session?.user?.id
  });
  const completionRate = taskStats.total > 0 ? Math.round(taskStats.completed / taskStats.total * 100) : 0;
  return <div className="space-y-6 w-full mb-8">
      
    </div>;
};