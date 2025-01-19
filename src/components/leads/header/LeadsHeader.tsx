import { Button } from "@/components/ui/button";
import { LeadFilters } from "../LeadFilters";
import { LeadSearch } from "../LeadSearch";
import { AddLeadDialog } from "../AddLeadDialog";
import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/use-settings";
import { usePhaseMutations } from "../kanban/usePhaseMutations";

interface LeadsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPipelineId: string | null;
  setSelectedPipelineId: (id: string | null) => void;
  viewMode: "kanban" | "list";
  setViewMode: (mode: "kanban" | "list") => void;
  currentPipelineName?: string;
}

export const LeadsHeader = ({
  searchQuery,
  setSearchQuery,
  selectedPipelineId,
  setSelectedPipelineId,
  viewMode,
  setViewMode,
  currentPipelineName,
}: LeadsHeaderProps) => {
  const [showAddLead, setShowAddLead] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPipelineName, setEditingPipelineName] = useState(currentPipelineName || "");
  const { settings } = useSettings();
  const { updatePipelineName } = usePhaseMutations();

  const handleEditModeToggle = () => {
    if (isEditMode) {
      handleSaveChanges();
    }
    setIsEditMode(!isEditMode);
    setEditingPipelineName(currentPipelineName || "");
  };

  const handleSaveChanges = async () => {
    if (!selectedPipelineId) return;
    
    try {
      await updatePipelineName.mutateAsync({
        id: selectedPipelineId,
        name: editingPipelineName
      });
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating pipeline name:", error);
    }
  };

  return (
    <div className="space-y-4">
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

      <div className="h-px bg-border" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LeadFilters
            selectedPipelineId={selectedPipelineId}
            setSelectedPipelineId={setSelectedPipelineId}
            onEditPipeline={handleEditModeToggle}
            isEditMode={isEditMode}
            onPipelineNameChange={setEditingPipelineName}
          />
        </div>
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