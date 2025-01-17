import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LeadKanbanView } from "@/components/leads/LeadKanbanView";
import { LeadTableView } from "@/components/leads/LeadTableView";
import { LeadDetailView } from "@/components/leads/detail/LeadDetailView";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { LeadsHeader } from "@/components/leads/header/LeadsHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSession } from "@supabase/auth-helpers-react";

const Leads = () => {
  const session = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"kanban" | "list">(
    isMobile ? "list" : "kanban"
  );

  // Get all pipelines
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
    queryKey: ["leads", searchQuery, selectedPhase, selectedPlatform, selectedPipelineId],
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

      if (selectedPhase) {
        query = query.eq("phase_id", selectedPhase);
      }

      if (selectedPlatform) {
        query = query.eq("platform", selectedPlatform);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id && !!selectedPipelineId,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full space-y-8">
      <LeadsHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPhase={selectedPhase}
        setSelectedPhase={setSelectedPhase}
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
        selectedPipelineId={selectedPipelineId}
        setSelectedPipelineId={setSelectedPipelineId}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {viewMode === "kanban" ? (
        <LeadKanbanView 
          leads={leads} 
          onLeadClick={(id) => setSelectedLeadId(id)}
          selectedPipelineId={selectedPipelineId}
        />
      ) : (
        <LeadTableView 
          leads={leads} 
          onLeadClick={(id) => setSelectedLeadId(id)}
          selectedPipelineId={selectedPipelineId}
        />
      )}

      <LeadDetailView
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />

      {showSendMessage && (
        <SendMessageDialog trigger={<div style={{ display: "none" }} />} />
      )}
    </div>
  );
};

export default Leads;