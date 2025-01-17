import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { PipelineSelector } from "@/components/leads/pipeline/PipelineSelector";

interface LeadsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPhase: string | null;
  setSelectedPhase: (phase: string | null) => void;
  selectedPlatform: string | null;
  setSelectedPlatform: (platform: string | null) => void;
  selectedPipelineId: string | null;
  setSelectedPipelineId: (id: string) => void;
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
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Lead suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
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
            selectedPipelineId={selectedPipelineId}
            setSelectedPipelineId={setSelectedPipelineId}
          />
          <div className="flex gap-2">
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              onClick={() => setViewMode("kanban")}
              size="sm"
            >
              Kanban
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              size="sm"
            >
              Liste
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};