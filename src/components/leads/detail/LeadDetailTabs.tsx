import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoteList } from "./NoteList";
import { TaskList } from "./TaskList";
import { LeadMessages } from "./LeadMessages";
import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";
import { useSettings } from "@/hooks/use-settings";
import { MessageSquare, CheckSquare, StickyNote, Calendar, Upload, Presentation } from "lucide-react";
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
  notes: "#FEF7CD", // Soft yellow for notes
  tasks: "#40E0D0", // Turquoise for tasks
  appointments: "#FFA500", // Orange for appointments
  messages: "#D3E4FD", // Soft blue for messages
  uploads: "#E5DEFF", // Soft purple for uploads
  presentations: "#FFDEE2", // Soft pink for presentations
};

export function LeadDetailTabs({ lead }: LeadDetailTabsProps) {
  const { settings } = useSettings();
  
  return (
    <Tabs defaultValue="notes" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger 
          value="notes" 
          className={cn(
            "flex items-center gap-2 relative",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "data-[state=active]:after:bg-[#FEF7CD]"
          )}
        >
          <StickyNote className="h-4 w-4" />
          {settings?.language === "en" ? "Notes" : "Notizen"}
        </TabsTrigger>
        
        <TabsTrigger 
          value="tasks"
          className={cn(
            "flex items-center gap-2 relative",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "data-[state=active]:after:bg-[#40E0D0]"
          )}
        >
          <CheckSquare className="h-4 w-4" />
          {settings?.language === "en" ? "Tasks" : "Aufgaben"}
        </TabsTrigger>
        
        <TabsTrigger 
          value="appointments"
          className={cn(
            "flex items-center gap-2 relative",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "data-[state=active]:after:bg-[#FFA500]"
          )}
        >
          <Calendar className="h-4 w-4" />
          {settings?.language === "en" ? "Appointments" : "Termine"}
        </TabsTrigger>
        
        <TabsTrigger 
          value="messages"
          className={cn(
            "flex items-center gap-2 relative",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "data-[state=active]:after:bg-[#D3E4FD]"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          {settings?.language === "en" ? "Messages" : "Nachrichten"}
        </TabsTrigger>

        <TabsTrigger 
          value="uploads"
          className={cn(
            "flex items-center gap-2 relative",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "data-[state=active]:after:bg-[#E5DEFF]"
          )}
        >
          <Upload className="h-4 w-4" />
          {settings?.language === "en" ? "Uploads" : "Uploads"}
        </TabsTrigger>

        <TabsTrigger 
          value="presentations"
          className={cn(
            "flex items-center gap-2 relative",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "data-[state=active]:after:bg-[#FFDEE2]"
          )}
        >
          <Presentation className="h-4 w-4" />
          {settings?.language === "en" ? "Presentations" : "Präsentationen"}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="notes">
        {/* Only show note creation form */}
        <div className="p-4 bg-white rounded-lg shadow">
          {/* Note creation form will be implemented here */}
        </div>
      </TabsContent>

      <TabsContent value="tasks">
        {/* Only show task creation form */}
        <div className="p-4 bg-white rounded-lg shadow">
          {/* Task creation form will be implemented here */}
        </div>
      </TabsContent>

      <TabsContent value="appointments">
        {/* Only show appointment creation form */}
        <div className="p-4 bg-white rounded-lg shadow">
          {/* Appointment creation form will be implemented here */}
        </div>
      </TabsContent>

      <TabsContent value="messages">
        {/* Only show message creation form */}
        <div className="p-4 bg-white rounded-lg shadow">
          {/* Message creation form will be implemented here */}
        </div>
      </TabsContent>

      <TabsContent value="uploads">
        {/* Upload functionality */}
        <div className="p-4 bg-white rounded-lg shadow">
          {/* Upload form will be implemented here */}
        </div>
      </TabsContent>

      <TabsContent value="presentations">
        {/* Presentation selection and sending */}
        <div className="p-4 bg-white rounded-lg shadow">
          {/* Presentation selection and sending form will be implemented here */}
        </div>
      </TabsContent>
    </Tabs>
  );
}