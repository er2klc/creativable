import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LeadSearch } from "@/components/leads/LeadSearch";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadKanbanView } from "@/components/leads/LeadKanbanView";
import { LeadTableView } from "@/components/leads/LeadTableView";
import { LeadDetailView } from "@/components/leads/LeadDetailView";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { LeadPhaseManager } from "@/components/leads/LeadPhaseManager";
import { Settings2, LayoutList, LayoutDashboard } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Leads = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const { settings } = useSettings();

  useEffect(() => {
    if (searchParams.get("action") === "send-message") {
      setShowSendMessage(true);
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
    <div className="space-y-8 max-w mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {settings?.language === "en" ? "Contacts" : "Kontakte"}
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutDashboard className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>
                  {settings?.language === "en" ? "Manage Phases" : "Phasen verwalten"}
                </SheetTitle>
                <SheetDescription>
                  {settings?.language === "en"
                    ? "Add new phases or modify existing ones. Drag and drop to reorder phases."
                    : "Fügen Sie neue Phasen hinzu oder ändern Sie bestehende. Ziehen und ablegen zum Neuordnen der Phasen."}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                <LeadPhaseManager />
              </div>
            </SheetContent>
          </Sheet>
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
        <SendMessageDialog
          trigger={<div style={{ display: "none" }} />}
        />
      )}
    </div>
  );
};

export default Leads;
