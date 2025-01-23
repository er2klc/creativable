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
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { LeadWithRelations } from "./types/lead";

interface LeadDetailTabsProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<LeadWithRelations>) => void;
}

export const LeadDetailTabs = ({
  lead,
  onUpdateLead,
}: LeadDetailTabsProps) => {
  const { settings } = useSettings();
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);

  return (
    <Tabs defaultValue="notes" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="notes">
          {settings?.language === "en" ? "Notes" : "Notizen"}
        </TabsTrigger>
        <TabsTrigger value="tasks">
          {settings?.language === "en" ? "Tasks" : "Aufgaben"}
        </TabsTrigger>
        <TabsTrigger value="appointments">
          {settings?.language === "en" ? "Appointments" : "Termine"}
        </TabsTrigger>
        <TabsTrigger value="messages">
          {settings?.language === "en" ? "Messages" : "Nachrichten"}
        </TabsTrigger>
        <TabsTrigger value="uploads">
          {settings?.language === "en" ? "Upload File" : "Datei hochladen"}
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
          <Button 
            onClick={() => setAppointmentDialogOpen(true)}
            className="w-full"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            {settings?.language === "en" ? "Add Appointment" : "Termin hinzufügen"}
          </Button>
          
          <NewAppointmentDialog
            open={appointmentDialogOpen}
            onOpenChange={setAppointmentDialogOpen}
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
    </Tabs>
  );
};