import { Button } from "@/components/ui/button";
import { LeadSearch } from "../LeadSearch";
import { LayoutGrid, List, ChevronDown, Instagram, Linkedin } from "lucide-react";
import { AddLeadDialog } from "../AddLeadDialog";
import { CreateInstagramContactDialog } from "../instagram/CreateInstagramContactDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface LeadsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPipelineId: string | null;
  setSelectedPipelineId: (id: string | null) => void;
  viewMode: "kanban" | "list";
  setViewMode: (mode: "kanban" | "list") => void;
}

export const LeadsHeader = ({
  searchQuery,
  setSearchQuery,
  selectedPipelineId,
  setSelectedPipelineId,
  viewMode,
  setViewMode,
}: LeadsHeaderProps) => {
  const [showAddLead, setShowAddLead] = useState(false);
  const [showInstagramDialog, setShowInstagramDialog] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Kontakte</h1>
        <div className="flex-1 max-w-md">
          <LeadSearch value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("kanban")}
            className={viewMode === "kanban" ? "bg-muted" : ""}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-muted" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowAddLead(true)}>
            Kontakt hinzufügen ✨
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-black text-white hover:bg-black/90">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowInstagramDialog(true)}>
                <Instagram className="h-4 w-4 mr-2" />
                <span>Instagram</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Linkedin className="h-4 w-4 mr-2" />
                <span>LinkedIn</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="h-px bg-border" />

      <AddLeadDialog
        open={showAddLead}
        onOpenChange={setShowAddLead}
        pipelineId={selectedPipelineId}
      />

      <CreateInstagramContactDialog
        open={showInstagramDialog}
        onOpenChange={setShowInstagramDialog}
        pipelineId={selectedPipelineId}
        defaultPhase={undefined}
      />
    </div>
  );
};