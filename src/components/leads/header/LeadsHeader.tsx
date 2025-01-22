import { Button } from "@/components/ui/button";
import { LeadSearch } from "../LeadSearch";
import { LayoutGrid, List } from "lucide-react";
import { AddLeadDialog } from "../AddLeadDialog";
import { CreateInstagramContactDialog } from "../instagram/CreateInstagramContactDialog";
import { LeadFilters } from "../LeadFilters";
import { useState } from "react";

interface LeadsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPipelineId: string | null;
  setSelectedPipelineId: (id: string | null) => void;
  viewMode: "kanban" | "list";
  setViewMode: (mode: "kanban" | "list") => void;
  setIsEditMode: (isEdit: boolean) => void;
}

export const LeadsHeader = ({
  searchQuery,
  setSearchQuery,
  selectedPipelineId,
  setSelectedPipelineId,
  viewMode,
  setViewMode,
  setIsEditMode,
}: LeadsHeaderProps) => {
  const [showAddLead, setShowAddLead] = useState(false);
  const [showInstagramDialog, setShowInstagramDialog] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {/* Add Contact Button */}
        <div className="flex">
          <Button
            variant="default"
            className="bg-black text-white hover:bg-black/90"
            onClick={() => setShowAddLead(true)}
          >
            Kontakt hinzufügen ✨
          </Button>
        </div>

        {/* Search Field */}
        <div className="flex-1 max-w-md">
          <LeadSearch value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Pipeline Selection */}
        <LeadFilters
          selectedPipelineId={selectedPipelineId}
          setSelectedPipelineId={setSelectedPipelineId}
          onEditModeChange={setIsEditMode}
        />

        {/* View Mode Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "kanban" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("kanban")}
            className="h-9 w-9"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="h-9 w-9"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AddLeadDialog
        open={showAddLead}
        onOpenChange={setShowAddLead}
        pipelineId={selectedPipelineId}
      />

      <CreateInstagramContactDialog
        open={showInstagramDialog}
        onOpenChange={setShowInstagramDialog}
        pipelineId={selectedPipelineId}
      />
    </div>
  );
};