import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LeadSearch } from "@/components/leads/LeadSearch";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTableView } from "@/components/leads/LeadTableView";
import { LeadKanbanView } from "@/components/leads/LeadKanbanView";
import { LeadDetailView } from "@/components/leads/LeadDetailView";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { LayoutList, Kanban } from "lucide-react";

const Leads = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<"table" | "kanban">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showSendMessage, setShowSendMessage] = useState(false);

  useEffect(() => {
    if (searchParams.get("action") === "send-message") {
      setShowSendMessage(true);
      // Remove the action parameter from URL
      searchParams.delete("action");
      setSearchParams(searchParams);
    }
  }, [searchParams]);

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

      if (error) {
        throw error;
      }

      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Leads</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setView("table")}
            className={view === "table" ? "bg-muted" : ""}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setView("kanban")}
            className={view === "kanban" ? "bg-muted" : ""}
          >
            <Kanban className="h-4 w-4" />
          </Button>
          <AddLeadDialog />
        </div>
      </div>

      <div className="flex gap-4">
        <LeadSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <LeadFilters
          selectedPhase={selectedPhase}
          setSelectedPhase={setSelectedPhase}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
        />
      </div>

      {view === "table" ? (
        <LeadTableView leads={leads} onLeadClick={(id) => setSelectedLeadId(id)} />
      ) : (
        <LeadKanbanView leads={leads} onLeadClick={(id) => setSelectedLeadId(id)} />
      )}

      <LeadDetailView
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />

      {showSendMessage && (
        <SendMessageDialog
          trigger={<div style={{ display: "none" }} />}
        />
      )}
    </div>
  );
};

export default Leads;