import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoteList } from "./NoteList";
import { TaskList } from "./TaskList";
import { LeadMessages } from "./LeadMessages";
import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";

interface LeadDetailTabsProps {
  lead: Tables<"leads"> & {
    platform: Platform;
    messages: Tables<"messages">[];
    tasks: Tables<"tasks">[];
  };
}

export function LeadDetailTabs({ lead }: LeadDetailTabsProps) {
  return (
    <Tabs defaultValue="notes" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="notes">Notizen</TabsTrigger>
        <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
        <TabsTrigger value="messages">Nachrichten</TabsTrigger>
      </TabsList>
      <TabsContent value="notes">
        <NoteList leadId={lead.id} />
      </TabsContent>
      <TabsContent value="tasks">
        <TaskList leadId={lead.id} />
      </TabsContent>
      <TabsContent value="messages">
        <LeadMessages messages={lead.messages} />
      </TabsContent>
    </Tabs>
  );
}