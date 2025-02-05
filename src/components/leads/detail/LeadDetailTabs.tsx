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
import { CalendarIcon, Video, Youtube, FileText } from "lucide-react";
import { PresentationTab } from "./tabs/PresentationTab";

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
  zoom: "#2D8CFF",
  youtube: "#FF0000",
  documents: "#34D399"
};

export function LeadDetailTabs({ lead }: LeadDetailTabsProps) {
  const { settings } = useSettings();
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("notes");
  const [presentationDialogOpen, setPresentationDialogOpen] = useState(false);

  const handleTabChange = (value: string) => {
    if (value === "appointments") {
      setAppointmentDialogOpen(true);
      return;
    }
    if (["zoom", "youtube", "documents"].includes(value)) {
      setPresentationDialogOpen(true);
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
          value="zoom"
          className="flex-1"
          style={{ borderBottom: `2px solid ${tabColors.zoom}` }}
        >
          <Video className="w-2 h-4" />
        </TabsTrigger>
        <TabsTrigger
          value="youtube"
          className="flex-1"
          style={{ borderBottom: `2px solid ${tabColors.youtube}` }}
        >
          <Youtube className="w-2 h-4" />
        </TabsTrigger>
        <TabsTrigger
          value="documents"
          className="flex-1"
          style={{ borderBottom: `2px solid ${tabColors.documents}` }}
        >
          <FileText className="w-2 h-4" />
        </TabsTrigger>
      </TabsList>

      <TabsContent value="notes" className="mt-4">
        <NoteTab leadId={lead.id} />
      </TabsContent>

      <TabsContent value="tasks" className="mt-4">
        <TaskTab leadId={lead.id} />
      </TabsContent>

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

      <TabsContent value="appointments" className="mt-4">
        <div className="space-y-4">
          {settings?.language === "en" ? "Manage Appointments Here" : "Hier Termine verwalten"}
        </div>
      </TabsContent>

      <TabsContent value="messages" className="mt-4">
        <MessageTab leadId={lead.id} platform={lead.platform} />
      </TabsContent>

      <TabsContent value="uploads" className="mt-4">
        <LeadFileUpload leadId={lead.id} />
      </TabsContent>

      <TabsContent value="zoom" className="mt-4">
        <PresentationTab 
          leadId={lead.id} 
          type="zoom"
          tabColors={tabColors}
          isOpen={presentationDialogOpen && selectedTab === "zoom"}
          onOpenChange={setPresentationDialogOpen}
        />
      </TabsContent>

      <TabsContent value="youtube" className="mt-4">
        <PresentationTab 
          leadId={lead.id} 
          type="youtube"
          tabColors={tabColors}
          isOpen={presentationDialogOpen && selectedTab === "youtube"}
          onOpenChange={setPresentationDialogOpen}
        />
      </TabsContent>

      <TabsContent value="documents" className="mt-4">
        <PresentationTab 
          leadId={lead.id} 
          type="documents"
          tabColors={tabColors}
          isOpen={presentationDialogOpen && selectedTab === "documents"}
          onOpenChange={setPresentationDialogOpen}
        />
      </TabsContent>
    </Tabs>
  );
}
