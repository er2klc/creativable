
import { useState, useEffect } from "react";
import { 
  CalendarIcon, Video, Youtube, FileText, Phone, 
  MessageSquare, Pencil, ListTodo, Upload, Mail 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSettings } from "@/hooks/use-settings";
import { Platform } from "@/config/platforms";
import { Tables } from "@/integrations/supabase/types";
import { NoteTab } from "./tabs/NoteTab";
import { TaskTab } from "./tabs/TaskTab";
import { MessageTab } from "./tabs/MessageTab";
import { NewAppointmentDialog } from "@/components/calendar/NewAppointmentDialog";
import { LeadFileUpload } from "./files/LeadFileUpload";
import { PresentationTab } from "./tabs/PresentationTab";
import { CallScriptGenerator } from "./components/CallScriptGenerator";
import { MessageGenerator } from "./components/MessageGenerator";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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
  documents: "#34D399",
  callscript: "#FF7F50",
  messagegenerator: "#8A2BE2"
};

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  showDialog?: boolean;
}

export function LeadDetailTabs({ lead }: LeadDetailTabsProps) {
  const { settings } = useSettings();
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("notes");
  const [presentationDialogOpen, setPresentationDialogOpen] = useState(false);
  const [existingAnalysis, setExistingAnalysis] = useState("");
  
  const isEnglish = settings?.language === "en";

  const tabItems: TabItem[] = [
    {
      id: "notes",
      label: isEnglish ? "Notes" : "Notizen",
      icon: <Pencil className="h-4 w-4" />,
      color: tabColors.notes
    },
    {
      id: "tasks",
      label: isEnglish ? "Tasks" : "Aufgaben",
      icon: <ListTodo className="h-4 w-4" />,
      color: tabColors.tasks
    },
    {
      id: "appointments",
      label: isEnglish ? "Appointments" : "Termine",
      icon: <CalendarIcon className="h-4 w-4" />,
      color: tabColors.appointments,
      showDialog: true
    },
    {
      id: "messages",
      label: isEnglish ? "Messages" : "Nachrichten",
      icon: <Mail className="h-4 w-4" />,
      color: tabColors.messages
    },
    {
      id: "uploads",
      label: isEnglish ? "Upload File" : "Datei hochladen",
      icon: <Upload className="h-4 w-4" />,
      color: tabColors.uploads
    },
    {
      id: "callscript",
      label: isEnglish ? "Call Script" : "Telefonscript",
      icon: <Phone className="h-4 w-4" />,
      color: tabColors.callscript
    },
    {
      id: "messagegenerator",
      label: isEnglish ? "Create Message" : "Nachricht erstellen",
      icon: <MessageSquare className="h-4 w-4" />,
      color: tabColors.messagegenerator
    },
    {
      id: "zoom",
      label: "Zoom",
      icon: <Video className="h-4 w-4" />,
      color: tabColors.zoom,
      showDialog: true
    },
    {
      id: "youtube",
      label: "YouTube",
      icon: <Youtube className="h-4 w-4" />,
      color: tabColors.youtube,
      showDialog: true
    },
    {
      id: "documents",
      label: isEnglish ? "Documents" : "Dokumente",
      icon: <FileText className="h-4 w-4" />,
      color: tabColors.documents,
      showDialog: true
    }
  ];

  useEffect(() => {
    async function fetchExistingAnalysis() {
      if (!lead.id || !lead.phase_id) return;
      
      try {
        const { data, error } = await supabase
          .from("phase_based_analyses")
          .select("content")
          .eq("lead_id", lead.id)
          .eq("phase_id", lead.phase_id)
          .maybeSingle();

        if (error) throw error;
        
        if (data?.content) {
          setExistingAnalysis(data.content);
        }
      } catch (error) {
        console.error("Error fetching analysis:", error);
      }
    }
    
    fetchExistingAnalysis();
  }, [lead.id, lead.phase_id]);

  const handleTabChange = (value: string) => {
    const tabItem = tabItems.find(tab => tab.id === value);
    
    if (tabItem?.showDialog) {
      if (value === "appointments") {
        setAppointmentDialogOpen(true);
        return;
      }
      
      setPresentationDialogOpen(true);
    }
    
    setSelectedTab(value);
  };

  return (
    <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full rounded-lg border bg-card text-card-foreground shadow-sm p-4 pt-4">
      <ScrollArea className="w-full pb-2" orientation="horizontal">
        <TabsList className="inline-flex w-max px-4 mb-2">
          <TooltipProvider>
            {tabItems.map((tab) => (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value={tab.id}
                    className={cn(
                      "flex gap-2 items-center px-4 py-2 relative",
                      "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full",
                      `after:bg-[${tab.color}]`
                    )}
                  >
                    {tab.icon}
                    <span className="sr-only md:not-sr-only md:inline-block">
                      {tab.label}
                    </span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  {tab.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </TabsList>
      </ScrollArea>

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

      <TabsContent value="callscript" className="mt-4">
        <CallScriptGenerator 
          leadId={lead.id} 
          leadName={lead.name}
          leadPlatform={lead.platform}
          leadIndustry={lead.industry}
          existingAnalysis={existingAnalysis}
        />
      </TabsContent>

      <TabsContent value="messagegenerator" className="mt-4">
        <MessageGenerator 
          leadId={lead.id} 
          leadName={lead.name}
          platform={lead.platform}
          existingAnalysis={existingAnalysis}
        />
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
