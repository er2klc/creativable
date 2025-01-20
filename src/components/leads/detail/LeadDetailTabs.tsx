import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";
import { NoteTab } from "./tabs/NoteTab";
import { TaskTab } from "./tabs/TaskTab";
import { MessageTab } from "./tabs/MessageTab";
import { PlaceholderTab } from "./tabs/PlaceholderTab";

interface LeadDetailTabsProps {
  lead: Tables<"leads"> & {
    platform: Platform;
    messages: Tables<"messages">[];
    tasks: Tables<"tasks">[];
    notes: Tables<"notes">[];
  };
}

const tabColors = {
  notes: "#FEF08A",         // Gelb-Pastell (passt zu border-yellow-500)
  tasks: "#A5F3FC",         // Hell-Cyan (passt zu border-cyan-500)
  appointments: "#FDBA74",  // Hell-Orange (passt zu border-orange-500)
  messages: "#BFDBFE",      // Hell-Blau (passt zu border-blue-500)
  uploads: "#E5E7EB",       // Hell-Grau (passt zu border-gray-500)
  presentations: "#A5B4FC", // Hell-Indigo (passt zu border-indigo-500)
};

export function LeadDetailTabs({ lead }: LeadDetailTabsProps) {
  const { settings } = useSettings();

  return (
    <Tabs defaultValue="notes" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger
          value="notes"
          className="flex-1"
          style={{ borderBottom: `2px solid ${tabColors.notes}` }}
        >
          {settings?.language === "en" ? "Notes" : "Notizen"}
        </TabsTrigger>
        <TabsTrigger
          value="tasks"
          className="flex-1"
          style={{ borderBottom: `2px solid ${tabColors.tasks}` }}
        >
          {settings?.language === "en" ? "Tasks" : "Aufgaben"}
        </TabsTrigger>
        <TabsTrigger
          value="appointments"
          className="flex-1"
          style={{ borderBottom: `2px solid ${tabColors.appointments}` }}
        >
          {settings?.language === "en" ? "Appointments" : "Termine"}
        </TabsTrigger>
        <TabsTrigger
          value="messages"
          className="flex-1"
          style={{ borderBottom: `2px solid ${tabColors.messages}` }}
        >
          {settings?.language === "en" ? "Messages" : "Nachrichten"}
        </TabsTrigger>
        <TabsTrigger
          value="uploads"
          className="flex-1"
          style={{ borderBottom: `2px solid ${tabColors.uploads}` }}
        >
          {settings?.language === "en" ? "Uploads" : "Uploads"}
        </TabsTrigger>
        <TabsTrigger
          value="presentations"
          className="flex-1"
          style={{ borderBottom: `2px solid ${tabColors.presentations}` }}
        >
          {settings?.language === "en" ? "Presentations" : "Präsentationen"}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="notes" className="mt-4">
        <NoteTab leadId={lead.id} />
      </TabsContent>

      <TabsContent value="tasks" className="mt-4">
        <TaskTab leadId={lead.id} />
      </TabsContent>

      <TabsContent value="appointments" className="mt-4">
        <PlaceholderTab title="Appointment" />
      </TabsContent>

      <TabsContent value="messages" className="mt-4">
        <MessageTab leadId={lead.id} platform={lead.platform} />
      </TabsContent>

      <TabsContent value="uploads" className="mt-4">
        <PlaceholderTab title="Upload" />
      </TabsContent>

      <TabsContent value="presentations" className="mt-4">
        <PlaceholderTab title="Presentation" />
      </TabsContent>
    </Tabs>
  );
}
