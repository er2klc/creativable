import { Button } from "@/components/ui/button";
import { Settings2, LayoutList, LayoutDashboard } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LeadSearch } from "@/components/leads/LeadSearch";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";
import { PipelineSelector } from "@/components/leads/pipeline/PipelineSelector";
import { LeadPhaseManager } from "@/components/leads/LeadPhaseManager";
import { useSettings } from "@/hooks/use-settings";

interface LeadsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPhase: string | null;
  setSelectedPhase: (phase: string | null) => void;
  selectedPlatform: string | null;
  setSelectedPlatform: (platform: string | null) => void;
  selectedPipelineId: string | null;
  setSelectedPipelineId: (id: string | null) => void;
  viewMode: "kanban" | "list";
  setViewMode: (mode: "kanban" | "list") => void;
}

export const LeadsHeader = ({
  searchQuery,
  setSearchQuery,
  selectedPhase,
  setSelectedPhase,
  selectedPlatform,
  setSelectedPlatform,
  selectedPipelineId,
  setSelectedPipelineId,
  viewMode,
  setViewMode,
}: LeadsHeaderProps) => {
  const { settings } = useSettings();

  return (
    <div className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="w-full py-4">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-bold">
              {settings?.language === "en" ? "Contacts" : "Kontakte"}
            </h1>

            <div className="flex-1 min-w-[200px] max-w-[800px]">
              <LeadSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <PipelineSelector
                selectedPipelineId={selectedPipelineId}
                onPipelineSelect={setSelectedPipelineId}
              />
              <LeadFilters
                selectedPhase={selectedPhase}
                setSelectedPhase={setSelectedPhase}
                selectedPlatform={selectedPlatform}
                setSelectedPlatform={setSelectedPlatform}
              />
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "kanban" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("kanban")}
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>
                      {settings?.language === "en"
                        ? "Manage Phases"
                        : "Phasen verwalten"}
                    </SheetTitle>
                    <SheetDescription>
                      {settings?.language === "en"
                        ? "Add new phases or modify existing ones. Drag and drop to reorder phases."
                        : "Fügen Sie neue Phasen hinzu oder ändern Sie bestehende. Ziehen und ablegen zum Neuordnen der Phasen."}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4">
                    <LeadPhaseManager />
                  </div>
                </SheetContent>
              </Sheet>
              <AddLeadDialog />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};