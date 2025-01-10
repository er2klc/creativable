import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useSettings } from "@/hooks/use-settings";
import { CalendarClock, BrainCircuit } from "lucide-react";

export const DashboardCards = () => {
  const session = useSession();
  const { settings } = useSettings();

  const { data: tasks } = useQuery({
    queryKey: ["dashboard-tasks"],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("completed", false)
        .order("due_date", { ascending: true })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: leads } = useQuery({
    queryKey: ["dashboard-leads"],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            {settings?.language === "en" ? "Current Tasks" : "Aktuelle Aufgaben"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasks && tasks.length > 0 ? (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li key={task.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span>{task.title}</span>
                    {task.due_date && (
                      <span className="text-muted-foreground">
                        {new Date(task.due_date).toLocaleDateString(
                          settings?.language === "en" ? "en-US" : "de-DE"
                        )}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {settings?.language === "en" 
                ? "No tasks available" 
                : "Keine Aufgaben vorhanden"}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            {settings?.language === "en" ? "AI Recommendations" : "KI-Empfehlungen"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leads && leads.length > 0 ? (
            <ul className="space-y-2">
              {leads.map((lead) => (
                <li key={lead.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span>{lead.name}</span>
                    <span className="text-muted-foreground">{lead.phase}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {settings?.language === "en"
                ? "No recommendations available"
                : "Keine Empfehlungen verfügbar"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};