import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import { NoteTab } from "./tabs/NoteTab";
import { TaskTab } from "./tabs/TaskTab";
import { MessageTab } from "./tabs/MessageTab";
import { PlaceholderTab } from "./tabs/PlaceholderTab";
import { AppointmentList } from "./AppointmentList";
import { useState } from "react";
import { NewAppointmentDialog } from "@/components/calendar/NewAppointmentDialog";

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
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);

  return (
    <Tabs defaultValue="notes" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger
          value="notes"
          className="flex-1"
        >
          {settings?.language === "en" ? "Notes" : "Notizen"}
        </TabsTrigger>
        <TabsTrigger
          value="tasks"
          className="flex-1"
        >
          {settings?.language === "en" ? "Tasks" : "Aufgaben"}
        </TabsTrigger>
        <TabsTrigger
          value="appointments"
          className="flex-1"
          onClick={() => setIsAppointmentDialogOpen(true)}
        >
          {settings?.language === "en" ? "Appointments" : "Termine"}
        </TabsTrigger>
        <TabsTrigger
          value="messages"
          className="flex-1"
        >
          {settings?.language === "en" ? "Messages" : "Nachrichten"}
        </TabsTrigger>
        <TabsTrigger
          value="uploads"
          className="flex-1"
        >
          {settings?.language === "en" ? "Uploads" : "Uploads"}
        </TabsTrigger>
        <TabsTrigger
          value="presentations"
          className="flex-1"
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
        <AppointmentList leadId={lead.id} />
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

      <NewAppointmentDialog
        open={isAppointmentDialogOpen}
        onOpenChange={setIsAppointmentDialogOpen}
        initialSelectedDate={new Date()}
        appointmentToEdit={{
          id: '',
          leadId: lead.id,
          time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          title: '',
          color: '#40E0D0',
          meeting_type: 'phone_call'
        }}
      />
    </Tabs>
  );
}