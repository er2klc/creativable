import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LeadSearch } from "@/components/leads/LeadSearch";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTableView } from "@/components/leads/LeadTableView";
import { LeadKanbanView } from "@/components/leads/LeadKanbanView";
import { LayoutList, LayoutKanban, Plus } from "lucide-react";

const Leads = () => {
  const [view, setView] = useState<"table" | "kanban">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const { data: leads = [], isLoading } = useQuery<Tables<"leads">[]>({
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
            <LayoutKanban className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Lead
          </Button>
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
        <LeadTableView leads={leads} />
      ) : (
        <LeadKanbanView leads={leads} />
      )}
    </div>
  );
};

export default Leads;