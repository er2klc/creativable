import { useState } from "react";
import { LeadsHeader } from "@/components/leads/header/LeadsHeader";
import { LeadKanbanView } from "@/components/leads/LeadKanbanView";
import { LeadTableView } from "@/components/leads/LeadTableView";
import { useLeadsQuery } from "@/hooks/use-leads-query";
import { useNavigate } from "react-router-dom";

const Leads = () => {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const { data: leads = [] } = useLeadsQuery(selectedPipelineId);
  const navigate = useNavigate();

  const handleLeadClick = (id: string) => {
    navigate(`/contacts/${id}`);
  };

  return (
    <div className="flex flex-col h-screen">
      <LeadsHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPipelineId={selectedPipelineId}
        setSelectedPipelineId={setSelectedPipelineId}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onEditModeChange={(isEditMode) => {
          if (viewMode === "kanban") {
            // Pass edit mode to KanbanView
            const kanbanView = document.querySelector('[data-kanban-view]');
            if (kanbanView) {
              (kanbanView as any).__kanbanView?.setIsEditMode(isEditMode);
            }
          }
        }}
      />

      {viewMode === "kanban" ? (
        <LeadKanbanView
          leads={leads}
          selectedPipelineId={selectedPipelineId}
          setSelectedPipelineId={setSelectedPipelineId}
        />
      ) : (
        <LeadTableView
          leads={leads}
          onLeadClick={handleLeadClick}
          selectedPipelineId={selectedPipelineId}
        />
      )}
    </div>
  );
};

export default Leads;