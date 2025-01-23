import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageTab } from "./tabs/MessageTab";
import { NoteTab } from "./tabs/NoteTab";
import { TaskTab } from "./tabs/TaskTab";
import { PlaceholderTab } from "./tabs/PlaceholderTab";
import { LeadWithRelations } from "./types/lead";
import { useSettings } from "@/hooks/use-settings";

interface LeadDetailTabsProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<LeadWithRelations>) => void;
}

export const LeadDetailTabs = ({ lead, onUpdateLead }: LeadDetailTabsProps) => {
  const { settings } = useSettings();

  return (
    <Tabs defaultValue="messages" className="w-full">
      <TabsList>
        <TabsTrigger value="messages">
          {settings?.language === "en" ? "Messages" : "Nachrichten"}
        </TabsTrigger>
        <TabsTrigger value="notes">
          {settings?.language === "en" ? "Notes" : "Notizen"}
        </TabsTrigger>
        <TabsTrigger value="tasks">
          {settings?.language === "en" ? "Tasks" : "Aufgaben"}
        </TabsTrigger>
        <TabsTrigger value="files">
          {settings?.language === "en" ? "Files" : "Dateien"}
        </TabsTrigger>
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
        <PlaceholderTab title={settings?.language === "en" ? "Coming soon" : "Demnächst verfügbar"} />
      </TabsContent>
    </Tabs>
  );
};