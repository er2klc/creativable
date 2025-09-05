
import { TabsContent } from "@/components/ui/tabs";
import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";
import { NoteTab } from "../NoteTab";
import { TaskTab } from "../TaskTab";
import { MessageTab } from "../MessageTab";
import { LeadFileUpload } from "../../files/LeadFileUpload";
import { CallScriptGenerator } from "../../components/CallScriptGenerator";
import { MessageGenerator } from "../../components/MessageGenerator";
import PresentationTab from "../PresentationTab";
import { tabColors } from "../config/tabsConfig";
import { useSettings } from "@/hooks/use-settings";

interface TabContentProps {
  selectedTab: string;
  lead: Tables<"leads"> & {
    platform: Platform;
    messages: Tables<"messages">[];
    tasks: Tables<"tasks">[];
    notes: Tables<"notes">[];
  };
  existingAnalysis: string;
  presentationDialogOpen: boolean;
  setPresentationDialogOpen: (open: boolean) => void;
}

export function TabContent({ 
  selectedTab, 
  lead, 
  existingAnalysis, 
  presentationDialogOpen, 
  setPresentationDialogOpen 
}: TabContentProps) {
  const { settings } = useSettings();
  
  return (
    <>
      <TabsContent value="notes" className="mt-4">
        <NoteTab leadId={lead.id} />
      </TabsContent>

      <TabsContent value="tasks" className="mt-4">
        <TaskTab leadId={lead.id} />
      </TabsContent>

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
    </>
  );
}
