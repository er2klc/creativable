import { useState } from "react";
import { LeadsHeader } from "@/components/leads/header/LeadsHeader";
import { LeadKanbanView } from "@/components/leads/LeadKanbanView";
import { LeadTableView } from "@/components/leads/LeadTableView";
import { useLeadsQuery } from "@/hooks/use-leads-query";
import { useNavigate } from "react-router-dom";

const Leads = () => {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const { data: leads = [] } = useLeadsQuery(selectedPipelineId);
  const navigate = useNavigate();

  const handleLeadClick = (id: string) => {
    navigate(`/contacts/${id}`);
  };

  return (
    <div className="space-y-4 p-4">
      <LeadsHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPipelineId={selectedPipelineId}
        setSelectedPipelineId={setSelectedPipelineId}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setIsEditMode={setIsEditMode}
      />

      {viewMode === "kanban" ? (
        <LeadKanbanView
          leads={leads}
          selectedPipelineId={selectedPipelineId}
          setSelectedPipelineId={setSelectedPipelineId}
          isEditMode={isEditMode}
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