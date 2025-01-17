import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LeadKanbanView } from "@/components/leads/LeadKanbanView";
import { LeadTableView } from "@/components/leads/LeadTableView";
import { LeadDetailView } from "@/components/leads/LeadDetailView";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { LeadsHeader } from "@/components/leads/header/LeadsHeader";
import { useIsMobile } from "@/hooks/use-mobile";

const Leads = () => {
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

  const { data: pipelines = [] } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (pipelines.length > 0 && !selectedPipelineId) {
      setSelectedPipelineId(pipelines[0].id);
    }
  }, [pipelines]);

  useEffect(() => {
    if (searchParams.get("action") === "send-message") {
      setShowSendMessage(true);
      searchParams.delete("action");
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  useEffect(() => {
    setViewMode(isMobile ? "list" : viewMode);
  }, [isMobile]);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", searchQuery, selectedPhase, selectedPlatform],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,platform.ilike.%${searchQuery}%,industry.ilike.%${searchQuery}%`
        );
      }

      if (selectedPhase) {
        query = query.eq("phase", selectedPhase);
      }

      if (selectedPlatform) {
        query = query.eq("platform", selectedPlatform);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
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
        <LeadKanbanView leads={leads} onLeadClick={(id) => setSelectedLeadId(id)} />
      ) : (
        <LeadTableView leads={leads} onLeadClick={(id) => setSelectedLeadId(id)} />
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