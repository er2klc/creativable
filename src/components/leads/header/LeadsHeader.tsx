
import { Button } from "@/components/ui/button";
import { LeadSearch } from "../LeadSearch";
import { AddLeadDialog } from "../AddLeadDialog";
import { CreateInstagramContactDialog } from "../instagram/CreateInstagramContactDialog";
import { CreateLinkedInContactDialog } from "../linkedin/CreateLinkedInContactDialog";
import { LeadFilters } from "../LeadFilters";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { LeadHeaderTitle } from "./components/LeadHeaderTitle";
import { AddLeadButtons } from "./components/AddLeadButtons";
import { ViewModeButtons } from "./components/ViewModeButtons";

interface LeadsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPipelineId: string | null;
  setSelectedPipelineId: (id: string | null) => void;
  viewMode: "kanban" | "list";
  setViewMode: (mode: "kanban" | "list") => void;
  setIsEditMode: (isEdit: boolean) => void;
}

export const LeadsHeader = ({
  searchQuery,
  setSearchQuery,
  selectedPipelineId,
  setSelectedPipelineId,
  viewMode,
  setViewMode,
  setIsEditMode,
}: LeadsHeaderProps) => {
  const [showAddLead, setShowAddLead] = useState(false);
  const [showInstagramDialog, setShowInstagramDialog] = useState(false);
  const [showLinkedInDialog, setShowLinkedInDialog] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="w-full bg-background border-b" style={{ height: 'var(--header-height)' }}>
      <div className={`w-full h-full px-4 ${isMobile ? 'ml-0' : ''}`}>
        <div className="h-full flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div className="flex items-center justify-between md:justify-start gap-4 flex-shrink-0">
            <LeadHeaderTitle />
            <AddLeadButtons
              onAddLeadClick={() => setShowAddLead(true)}
              onInstagramClick={() => setShowInstagramDialog(true)}
              onLinkedInClick={() => setShowLinkedInDialog(true)}
            />
          </div>

          <div className="flex-1 min-w-0 max-w-xl">
            <LeadSearch value={searchQuery} onChange={setSearchQuery} />
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4">
            <LeadFilters
              selectedPipelineId={selectedPipelineId}
              setSelectedPipelineId={setSelectedPipelineId}
              onEditModeChange={setIsEditMode}
            />

            {!isMobile && (
              <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} />
            )}

            {!isMobile && (
              <HeaderActions profile={profile} userEmail={user?.email} />
            )}
          </div>
        </div>
      </div>

      <AddLeadDialog
        open={showAddLead}
        onOpenChange={setShowAddLead}
        pipelineId={selectedPipelineId}
      />

      <CreateInstagramContactDialog
        open={showInstagramDialog}
        onOpenChange={setShowInstagramDialog}
        pipelineId={selectedPipelineId}
      />

      <CreateLinkedInContactDialog
        open={showLinkedInDialog}
        onOpenChange={setShowLinkedInDialog}
        pipelineId={selectedPipelineId}
      />
    </div>
  );
};
