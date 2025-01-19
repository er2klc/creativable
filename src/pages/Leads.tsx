import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LeadKanbanView } from "@/components/leads/LeadKanbanView";
import { LeadTableView } from "@/components/leads/LeadTableView";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { LeadsHeader } from "@/components/leads/header/LeadsHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSession } from "@supabase/auth-helpers-react";

const Leads = () => {
  const session = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"kanban" | "list">(
    isMobile ? "list" : "kanban"
  );

  const { data: pipelines = [] } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", session.user.id)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Set initial pipeline
  useEffect(() => {
    if (pipelines.length > 0 && !selectedPipelineId) {
      const pipelineId = searchParams.get("pipeline") || pipelines[0].id;
      setSelectedPipelineId(pipelineId);
    }
  }, [pipelines, selectedPipelineId, searchParams]);

  // Update URL when pipeline changes
  useEffect(() => {
    if (selectedPipelineId) {
      searchParams.set("pipeline", selectedPipelineId);
      setSearchParams(searchParams);
    }
  }, [selectedPipelineId, searchParams, setSearchParams]);

  useEffect(() => {
    if (searchParams.get("action") === "send-message") {
      setShowSendMessage(true);
      searchParams.delete("action");
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setViewMode(isMobile ? "list" : viewMode);
  }, [isMobile, viewMode]);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", searchQuery, selectedPipelineId],
    queryFn: async () => {
      if (!session?.user?.id || !selectedPipelineId) return [];

      let query = supabase
        .from("leads")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("pipeline_id", selectedPipelineId)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,platform.ilike.%${searchQuery}%,industry.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id && !!selectedPipelineId,
  });

  const handleLeadClick = (id: string) => {
    navigate(`/contacts/${id}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full space-y-8">
      <LeadsHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPipelineId={selectedPipelineId}
        setSelectedPipelineId={setSelectedPipelineId}
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentPipelineName={pipelines.find(p => p.id === selectedPipelineId)?.name}
      />

      {viewMode === "kanban" ? (
        <LeadKanbanView 
          leads={leads}
          selectedPipelineId={selectedPipelineId}
          handleLeadClick={handleLeadClick}
          isEditMode={false}
          onSaveChanges={() => {}}
        />
      ) : (
        <LeadTableView 
          leads={leads}
          selectedPipelineId={selectedPipelineId}
          onLeadClick={handleLeadClick}
        />
      )}

      {showSendMessage && (
        <SendMessageDialog trigger={<div style={{ display: "none" }} />} />
      )}
    </div>
  );
}

export default Leads;