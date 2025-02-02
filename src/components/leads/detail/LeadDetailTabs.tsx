import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadWithRelations } from "@/types/leads";
import { TaskList } from "./TaskList";
import { NoteList } from "./NoteList";
import { LeadMessages } from "./LeadMessages";
import { useSettings } from "@/hooks/use-settings";

interface LeadDetailTabsProps {
  lead: LeadWithRelations;
}

export const LeadDetailTabs = ({ lead }: LeadDetailTabsProps) => {
  const { settings } = useSettings();

  return (
    <Tabs defaultValue="tasks" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="tasks">
          {settings?.language === "en" ? "Tasks" : "Aufgaben"}
        </TabsTrigger>
        <TabsTrigger value="notes">
          {settings?.language === "en" ? "Notes" : "Notizen"}
        </TabsTrigger>
        <TabsTrigger value="messages">
          {settings?.language === "en" ? "Messages" : "Nachrichten"}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tasks">
        <TaskList leadId={lead.id} />
      </TabsContent>
      <TabsContent value="notes">
        <NoteList leadId={lead.id} />
      </TabsContent>
      <TabsContent value="messages">
        <LeadMessages leadId={lead.id} messages={lead.messages || []} />
      </TabsContent>
    </Tabs>
  );
};