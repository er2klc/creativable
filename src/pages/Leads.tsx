import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Grid, List, Plus } from "lucide-react";
import { LeadSearch } from "@/components/leads/LeadSearch";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTableView } from "@/components/leads/LeadTableView";
import { LeadKanbanView } from "@/components/leads/LeadKanbanView";
import type { Tables } from "@/integrations/supabase/types";

type ViewMode = "table" | "kanban";
type Lead = Tables<"leads">;

const LeadsPage = () => {
  const session = useSession();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", session?.user.id, searchQuery, selectedPhase, selectedPlatform],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      if (selectedPhase) {
        query = query.eq("phase", selectedPhase);
      }

      if (selectedPlatform) {
        query = query.eq("platform", selectedPlatform);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching leads:", error);
        return [];
      }

      return data as Lead[];
    },
    enabled: !!session?.user.id,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Leads</h1>
        <div className="flex items-center gap-4">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "kanban" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("kanban")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Lead
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <LeadSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <LeadFilters
          selectedPhase={selectedPhase}
          setSelectedPhase={setSelectedPhase}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : viewMode === "table" ? (
        <LeadTableView leads={leads} />
      ) : (
        <LeadKanbanView leads={leads} />
      )}
    </div>
  );
};

export default LeadsPage;