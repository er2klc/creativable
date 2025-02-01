import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import { Platform } from "@/config/platforms";
import { Tables } from "@/integrations/supabase/types";
import { NoteTab } from "./tabs/NoteTab";
import { TaskTab } from "./tabs/TaskTab";
import { MessageTab } from "./tabs/MessageTab";
import { NewAppointmentDialog } from "@/components/calendar/NewAppointmentDialog";
import { LeadFileUpload } from "./files/LeadFileUpload";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";

interface LeadDetailTabsProps {
  lead: Tables<"leads"> & {
    platform: Platform;
    messages: Tables<"messages">[];
    tasks: Tables<"tasks">[];
    notes: Tables<"notes">[];
  };
}

const tabColors = {
  notes: "#FEF08A",
  tasks: "#A5F3FC",
  appointments: "#FDBA74",
  messages: "#BFDBFE",
  uploads: "#E5E7EB",
  presentations: "#A5B4FC",
};

export function LeadDetailTabs({ lead }: LeadDetailTabsProps) {
  const { settings } = useSettings();
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("notes");

  const handleTabChange = (value: string) => {
    if (value === "appointments") {
      setAppointmentDialogOpen(true);
      return;
    }
    setSelectedTab(value);
  };

  return (
    <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full rounded-lg border bg-card text-card-foreground shadow-sm p-4 pt-4">
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
          {settings?.language === "en" ? "Upload File" : "Datei hochladen"}
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
        <div className="space-y-4">
          <NewAppointmentDialog
            open={appointmentDialogOpen}
            onOpenChange={(open) => {
              setAppointmentDialogOpen(open);
              if (!open) {
                setSelectedTab("notes");
              }
            }}
            initialSelectedDate={new Date()}
            defaultValues={{
              leadId: lead.id,
              time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }),
              title: "",
              color: "#40E0D0",
              meeting_type: "phone_call"
            }}
          />
        </div>
      </TabsContent>

      <TabsContent value="messages" className="mt-4">
        <MessageTab leadId={lead.id} platform={lead.platform} />
      </TabsContent>

      <TabsContent value="uploads" className="mt-4">
        <LeadFileUpload leadId={lead.id} />
      </TabsContent>

      <TabsContent value="presentations" className="mt-4">
        <div className="p-4 text-center text-muted-foreground">
          {settings?.language === "en" 
            ? "Presentations feature coming soon" 
            : "Präsentationen-Funktion kommt bald"}
        </div>
      </TabsContent>
    </Tabs>
  );
}