
import { useState } from "react";
import { LeadsHeader } from "@/components/leads/header/LeadsHeader";
import { LeadKanbanView } from "@/components/leads/LeadKanbanView";
import { LeadTableView } from "@/components/leads/LeadTableView";
import { useLeadsQuery } from "@/hooks/use-leads-query";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/hooks/use-settings";
import { usePipelineManagement } from "@/components/leads/pipeline/hooks/usePipelineManagement";
import { useIsMobile } from "@/hooks/use-mobile";

const Leads = () => {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"kanban" | "list">(isMobile ? "list" : "kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  const {
    selectedPipelineId,
    setSelectedPipelineId,
  } = usePipelineManagement(null);

  // Fetch leads only after we have a pipeline ID
  const { data: leads = [] } = useLeadsQuery(selectedPipelineId);

  const handleLeadClick = (id: string) => {
    navigate(`/contacts/${id}`);
  };

  const handlePipelineSelect = (id: string) => {
    console.log("Pipeline selected:", id);
    setSelectedPipelineId(id);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <LeadsHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPipelineId={selectedPipelineId}
        setSelectedPipelineId={handlePipelineSelect}
        viewMode={isMobile ? "list" : viewMode}
        setViewMode={setViewMode}
        setIsEditMode={setIsEditMode}
      />

      <div className="flex-1 overflow-y-auto mt-[132px] md:mt-[84px]">
        {(!isMobile && viewMode === "kanban") ? (
          <LeadKanbanView
            leads={leads}
            selectedPipelineId={selectedPipelineId}
            setSelectedPipelineId={handlePipelineSelect}
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

export default Leads;

