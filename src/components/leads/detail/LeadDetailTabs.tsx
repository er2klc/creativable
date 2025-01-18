import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoteList } from "./NoteList";
import { TaskList } from "./TaskList";
import { LeadMessages } from "./LeadMessages";
import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";
import { useSettings } from "@/hooks/use-settings";
import { MessageSquare, CheckSquare, StickyNote, Calendar } from "lucide-react";
import { AppointmentList } from "./AppointmentList";

interface LeadDetailTabsProps {
  lead: Tables<"leads"> & {
    platform: Platform;
    messages: Tables<"messages">[];
    tasks: Tables<"tasks">[];
    notes: Tables<"notes">[];
  };
}

export function LeadDetailTabs({ lead }: LeadDetailTabsProps) {
  const { settings } = useSettings();
  
  return (
    <Tabs defaultValue="notes" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="notes" className="flex items-center gap-2">
          <StickyNote className="h-4 w-4" />
          {settings?.language === "en" ? "Notes" : "Notizen"}
        </TabsTrigger>
        <TabsTrigger value="tasks" className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4" />
          {settings?.language === "en" ? "Tasks" : "Aufgaben"}
        </TabsTrigger>
        <TabsTrigger value="appointments" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {settings?.language === "en" ? "Appointments" : "Termine"}
        </TabsTrigger>
        <TabsTrigger value="messages" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {settings?.language === "en" ? "Messages" : "Nachrichten"}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="notes">
        <NoteList leadId={lead.id} />
      </TabsContent>
      <TabsContent value="tasks">
        <TaskList leadId={lead.id} />
      </TabsContent>
      <TabsContent value="appointments">
        <AppointmentList leadId={lead.id} />
      </TabsContent>
      <TabsContent value="messages">
        <LeadMessages messages={lead.messages} />
      </TabsContent>
    </Tabs>
  );
}