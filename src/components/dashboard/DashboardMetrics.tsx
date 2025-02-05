import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useSettings } from "@/hooks/use-settings";
import { Progress } from "@/components/ui/progress";
import { Users, CheckSquare, Calendar } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";

export const DashboardMetrics = () => {
  const session = useSession();
  const { settings } = useSettings();

  // Get contacts by platform
  const { data: contactsByPlatform = [] } = useQuery({
    queryKey: ["contacts-by-platform"],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      const { data, error } = await supabase
        .from("leads")
        .select("platform")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error fetching contacts:", error);
        return [];
      }

      const platforms = data.reduce((acc, curr) => {
        acc[curr.platform] = (acc[curr.platform] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(platforms).map(([platform, count]) => ({
        platform,
        count,
      }));
    },
    enabled: !!session?.user?.id,
  });

  // Get task completion stats
  const { data: taskStats = { total: 0, completed: 0 } } = useQuery({
    queryKey: ["task-stats"],
    queryFn: async () => {
      if (!session?.user?.id) return { total: 0, completed: 0 };

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error fetching tasks:", error);
        return { total: 0, completed: 0 };
      }

      const total = data.length;
      const completed = data.filter(task => task.completed).length;
      return { total, completed };
    },
    enabled: !!session?.user?.id,
  });

  // Get upcoming appointments
  const { data: upcomingAppointments = [] } = useQuery({
    queryKey: ["upcoming-appointments"],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select("*, leads(name)")
        .eq("user_id", session.user.id)
        .not("due_date", "is", null)
        .order("due_date", { ascending: true });

      if (error) {
        console.error("Error fetching appointments:", error);
        return [];
      }

      return data.filter(task => 
        isToday(new Date(task.due_date)) || 
        isTomorrow(new Date(task.due_date))
      );
    },
    enabled: !!session?.user?.id,
  });

  const completionRate = taskStats.total > 0 
    ? Math.round((taskStats.completed / taskStats.total) * 100) 
    : 0;

  return (
    <div className="space-y-6 w-full mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Platform-specific contact counts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {settings?.language === "en" ? "Contacts by Platform" : "Kontakte nach Plattform"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contactsByPlatform.map(({ platform, count }) => (
                <div key={platform} className="flex justify-between items-center">
                  <span className="text-sm">{platform}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task completion stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {settings?.language === "en" ? "Task Progress" : "Aufgabenfortschritt"}
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{settings?.language === "en" ? "Completed" : "Erledigt"}</span>
                <span>{taskStats.completed} / {taskStats.total}</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {settings?.language === "en" ? "Upcoming Appointments" : "Anstehende Termine"}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingAppointments.map(appointment => (
                <div key={appointment.id} className="flex justify-between items-center text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium">{appointment.leads?.name}</span>
                    <span className="text-muted-foreground">
                      {format(new Date(appointment.due_date), "HH:mm")}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {isToday(new Date(appointment.due_date)) 
                      ? (settings?.language === "en" ? "Today" : "Heute")
                      : (settings?.language === "en" ? "Tomorrow" : "Morgen")}
                  </span>
                </div>
              ))}
              {upcomingAppointments.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  {settings?.language === "en" 
                    ? "No upcoming appointments" 
                    : "Keine anstehenden Termine"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};