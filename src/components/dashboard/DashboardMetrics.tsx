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
  const { settings } = useSettings();

  // Get contacts by platform
  const { data: contactsByPlatform = [] } = useQuery({
    queryKey: ["contacts-by-platform"],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      const { data, error } = await supabase
        .from("leads")
        .select("platform, status")
        .eq("user_id", session.user.id);

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
          count,
        })),
        statuses
      };
    },
    enabled: !!session?.user?.id,
  });

  // Get task completion stats and high priority tasks
  const { data: taskStats = { total: 0, completed: 0, highPriorityTasks: [] } } = useQuery({
    queryKey: ["task-stats"],
    queryFn: async () => {
      if (!session?.user?.id) return { total: 0, completed: 0, highPriorityTasks: [] };

      const { data, error } = await supabase
        .from("tasks")
        .select("*, leads(name)")
        .eq("user_id", session.user.id)
        .eq("completed", false)
        .order("due_date", { ascending: true });

      if (error) {
        console.error("Error fetching tasks:", error);
        return { total: 0, completed: 0, highPriorityTasks: [] };
      }

      const highPriorityTasks = data
        .filter(task => task.priority === "High")
        .slice(0, 3);

      const { data: completedData } = await supabase
        .from("tasks")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("completed", true);

      const total = (data?.length || 0) + (completedData?.length || 0);
      const completed = completedData?.length || 0;

      return { total, completed, highPriorityTasks };
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
        <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {settings?.language === "en" ? "Contacts by Platform" : "Kontakte nach Plattform"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contactsByPlatform.platforms?.map(({ platform, count }) => {
                const Icon = platformIcons[platform] || Users;
                return (
                  <div key={platform} className="flex justify-between items-center p-2 hover:bg-black/5 rounded-lg transition-colors">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{platform}</span>
                    </div>
                    <span className="font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Partner</span>
                  <span>{contactsByPlatform.statuses?.partner || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Kunde</span>
                  <span>{contactsByPlatform.statuses?.customer || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Not for now</span>
                  <span>{contactsByPlatform.statuses?.not_for_now || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Kein Interesse</span>
                  <span>{contactsByPlatform.statuses?.no_interest || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task completion stats */}
        <Card className="bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-gray-800">
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
              
              {/* High Priority Tasks */}
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">
                  {settings?.language === "en" ? "High Priority Tasks" : "Wichtige Aufgaben"}
                </h4>
                {taskStats.highPriorityTasks.length > 0 ? (
                  <div className="space-y-2">
                    {taskStats.highPriorityTasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-2 bg-red-50/50 dark:bg-red-900/20 rounded-lg">
                        <span className="text-sm truncate flex-1">{task.title}</span>
                        {priorityIcons[task.priority]}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    {settings?.language === "en" 
                      ? "No high priority tasks" 
                      : "Keine wichtigen Aufgaben"}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming appointments */}
        <Card className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {settings?.language === "en" ? "Upcoming Appointments" : "Anstehende Termine"}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map(appointment => (
                  <div key={appointment.id} className="flex justify-between items-center p-2 hover:bg-black/5 rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{appointment.leads?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(appointment.due_date), "HH:mm")}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {isToday(new Date(appointment.due_date)) 
                        ? (settings?.language === "en" ? "Today" : "Heute")
                        : (settings?.language === "en" ? "Tomorrow" : "Morgen")}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
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