
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

      <div className="flex-1 overflow-auto mt-[84px] relative">
        {viewMode === "kanban" ? (
          <div className="h-full overflow-x-auto">
            <LeadKanbanView
              leads={leads}
              selectedPipelineId={selectedPipelineId}
              setSelectedPipelineId={setSelectedPipelineId}
              isEditMode={isEditMode}
            />
          </div>
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

export default Leads;
