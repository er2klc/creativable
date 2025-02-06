import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LeadKanbanView } from "@/components/leads/LeadKanbanView";
import { LeadTableView } from "@/components/leads/LeadTableView";
import { LeadsHeader } from "@/components/leads/header/LeadsHeader";
import { useLeadsQuery } from "@/hooks/use-leads-query";
import { useState } from "react";

const Contacts = () => {
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
    <div className="flex flex-col h-screen overflow-hidden">
      <LeadsHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPipelineId={selectedPipelineId}
        setSelectedPipelineId={setSelectedPipelineId}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setIsEditMode={setIsEditMode}
      />

      <div className="flex-1 overflow-hidden">
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
    </div>
  );
};

export default Contacts;