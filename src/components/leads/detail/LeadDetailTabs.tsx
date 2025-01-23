import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Platform } from "@/config/platforms";
import { LeadWithRelations } from "./types/lead";
import { MessageTab } from "./tabs/MessageTab";
import { NoteTab } from "./tabs/NoteTab";
import { TaskTab } from "./tabs/TaskTab";
import { PlaceholderTab } from "./tabs/PlaceholderTab";

interface LeadDetailTabsProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<LeadWithRelations>) => void;
}

export const LeadDetailTabs = ({ lead, onUpdateLead }: LeadDetailTabsProps) => {
  return (
    <Tabs defaultValue="messages" className="w-full">
      <TabsList>
        <TabsTrigger value="messages">Nachrichten</TabsTrigger>
        <TabsTrigger value="notes">Notizen</TabsTrigger>
        <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
        <TabsTrigger value="files">Dateien</TabsTrigger>
      </TabsList>

      <TabsContent value="messages">
        <MessageTab lead={lead} />
      </TabsContent>

      <TabsContent value="notes">
        <NoteTab lead={lead} />
      </TabsContent>

      <TabsContent value="tasks">
        <TaskTab lead={lead} />
      </TabsContent>

      <TabsContent value="files">
        <PlaceholderTab />
      </TabsContent>
    </Tabs>
  );
};