import { Button } from "@/components/ui/button";
import { LeadFilters } from "../LeadFilters";
import { LeadSearch } from "../LeadSearch";
import { AddLeadDialog } from "../AddLeadDialog";
import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";

interface LeadsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPipelineId: string | null;
  setSelectedPipelineId: (id: string | null) => void;
  viewMode: "kanban" | "list";
  setViewMode: (mode: "kanban" | "list") => void;
}

export const LeadsHeader = ({
  searchQuery,
  setSearchQuery,
  selectedPipelineId,
  setSelectedPipelineId,
  viewMode,
  setViewMode,
}: LeadsHeaderProps) => {
  const [showAddLead, setShowAddLead] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Kontakte</h1>
        <div className="flex-1 max-w-md">
          <LeadSearch value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("kanban")}
            className={viewMode === "kanban" ? "bg-muted" : ""}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-muted" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <LeadFilters
          selectedPipelineId={selectedPipelineId}
          setSelectedPipelineId={setSelectedPipelineId}
        />
        <Button onClick={() => setShowAddLead(true)}>
          Neuer Kontakt ✨
        </Button>
      </div>

      <AddLeadDialog
        open={showAddLead}
        onOpenChange={setShowAddLead}
        pipelineId={selectedPipelineId}
      />
    </div>
  );
};