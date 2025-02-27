
import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import { Platform } from "@/config/platforms";
import { Tables } from "@/integrations/supabase/types";
import { NewAppointmentDialog } from "@/components/calendar/NewAppointmentDialog";
import { getTabItems } from "./tabs/config/tabsConfig";
import { TabHeader } from "./tabs/components/TabHeader";
import { TabContent } from "./tabs/components/TabContent";
import { useLeadAnalysis } from "./hooks/useLeadAnalysis";

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
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("notes");
  const [presentationDialogOpen, setPresentationDialogOpen] = useState(false);
  
  const isEnglish = settings?.language === "en";
  const tabItems = getTabItems(isEnglish);
  const existingAnalysis = useLeadAnalysis(lead.id, lead.phase_id);

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
      <TabHeader 
        tabItems={tabItems}
        selectedTab={selectedTab}
      />

      <TabContent 
        selectedTab={selectedTab}
        lead={lead}
        existingAnalysis={existingAnalysis}
        presentationDialogOpen={presentationDialogOpen}
        setPresentationDialogOpen={setPresentationDialogOpen}
      />

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
    </Tabs>
  );
}
