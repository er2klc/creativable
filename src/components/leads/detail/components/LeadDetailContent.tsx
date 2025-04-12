
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadWithRelations } from "@/types/leads"; // Updated to use our types
import { LeadContent } from "../LeadContent";
import { PhaseAnalysisTab } from "../tabs/PhaseAnalysisTab";
import { PresentationTab } from "../tabs/PresentationTab";
import { ScriptsTab } from "../tabs/ScriptsTab";
import { TabsView } from "@/components/ui/tabs-view";
import { BusinessMatchTab } from "../tabs/BusinessMatchTab";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { File, Settings, ChartLine, MessageSquare, UsersRound, MessageCircleQuestion, FilePlus } from "lucide-react";

interface LeadDetailContentProps {
  lead: LeadWithRelations;
  onUpdateLead: (lead: Partial<LeadWithRelations>) => void;
  isLoading?: boolean;
  onDeleteClick?: () => void;
  onDeletePhaseChange: (noteId: string) => void;
}

export const LeadDetailContent = ({
  lead,
  onUpdateLead,
  isLoading = false,
  onDeleteClick,
  onDeletePhaseChange,
}: LeadDetailContentProps) => {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<string>("main");

  const tabs = [
    {
      id: "main",
      label: settings?.language === "en" ? "Overview" : "Übersicht",
      icon: <File className="h-4 w-4" />,
    },
    {
      id: "scripts",
      label: settings?.language === "en" ? "Scripts" : "Scripts",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      id: "analysis",
      label: settings?.language === "en" ? "Analysis" : "Analyse",
      icon: <ChartLine className="h-4 w-4" />,
    },
    {
      id: "presentation",
      label: settings?.language === "en" ? "Presentations" : "Präsentationen",
      icon: <FilePlus className="h-4 w-4" />,
    },
    {
      id: "business_match",
      label: settings?.language === "en" ? "Business Match" : "Business Match",
      icon: <UsersRound className="h-4 w-4" />,
    },
    {
      id: "settings",
      label: settings?.language === "en" ? "Settings" : "Einstellungen",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        <Tabs defaultValue="main" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  tab.id === "settings" && "ml-auto"
                )}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="main" className="space-y-6">
            <LeadContent 
              lead={lead} 
              onUpdateLead={onUpdateLead} 
              onDeletePhaseChange={onDeletePhaseChange}
            />
          </TabsContent>

          <TabsContent value="scripts">
            <ScriptsTab lead={lead} />
          </TabsContent>

          <TabsContent value="analysis">
            <PhaseAnalysisTab lead={lead} />
          </TabsContent>

          <TabsContent value="presentation">
            <PresentationTab lead={lead} onUpdateLead={onUpdateLead} />
          </TabsContent>

          <TabsContent value="business_match">
            <BusinessMatchTab lead={lead} />
          </TabsContent>

          <TabsContent value="settings">
            <TabsView
              tabs={[
                {
                  id: "general",
                  label: settings?.language === "en" ? "General" : "Allgemein",
                  children: <div>Settings content</div>,
                },
                {
                  id: "delete",
                  label: settings?.language === "en" ? "Delete" : "Löschen",
                  children: <div>Delete content</div>,
                },
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
