import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadWithRelations } from "@/types/leads";
import { TaskList } from "./TaskList";
import { NoteList } from "./NoteList";
import { LeadMessages } from "./LeadMessages";

interface LeadDetailTabsProps {
  lead: LeadWithRelations;
}

export const LeadDetailTabs = ({ lead }: LeadDetailTabsProps) => {
  return (
    <Tabs defaultValue="tasks" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="messages">Messages</TabsTrigger>
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