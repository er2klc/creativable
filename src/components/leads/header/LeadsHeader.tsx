import { Button } from "@/components/ui/button";
import { LeadSearch } from "../LeadSearch";
import { LayoutGrid, List, ChevronDown, Instagram, Linkedin, Users } from "lucide-react";
import { AddLeadDialog } from "../AddLeadDialog";
import { CreateInstagramContactDialog } from "../instagram/CreateInstagramContactDialog";
import { CreateLinkedInContactDialog } from "../linkedin/CreateLinkedInContactDialog";
import { LeadFilters } from "../LeadFilters";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

  return (
    <div className="fixed top-0 left-[60px] right-0 z-[10] bg-background border-b md:left-[72px] group-hover:left-[240px] transition-[left] duration-300 ease-in-out">
      <div className="max-w-[100vw] px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Page Title */}
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h1 className="text-xl font-semibold">Kontakte</h1>
            </div>

            {/* Add Contact and Dropdown Buttons */}
            <div className="flex items-center gap-0">
              {/* Kontakt hinzufügen Button */}
              <Button
                variant="default"
                className="bg-black text-white hover:bg-black/90 rounded-r-none"
                onClick={() => setShowAddLead(true)}
              >
                ✨ Kontakt hinzufügen
              </Button>

              {/* Dropdown Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    className="bg-black text-white hover:bg-black/90 rounded-l-none"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowInstagramDialog(true)}>
                    <Instagram className="h-4 w-4 mr-2" />
                    <span>Instagram</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowLinkedInDialog(true)}>
                    <Linkedin className="h-4 w-4 mr-2" />
                    <span>LinkedIn</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search Field */}
          <div className="flex-1 min-w-[200px] max-w-xl">
            <LeadSearch value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Pipeline Selection */}
          <div className="flex-shrink-0">
            <LeadFilters
              selectedPipelineId={selectedPipelineId}
              setSelectedPipelineId={setSelectedPipelineId}
              onEditModeChange={setIsEditMode}
            />
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("kanban")}
              className="h-9 w-9"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="h-9 w-9"
            >
              <List className="h-4 w-4" />
            </Button>
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
