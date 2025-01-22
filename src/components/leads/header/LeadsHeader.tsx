import { Button } from "@/components/ui/button";
import { LeadSearch } from "../LeadSearch";
import { LayoutGrid, List, ChevronDown, Instagram, Linkedin, Pencil } from "lucide-react";
import { AddLeadDialog } from "../AddLeadDialog";
import { CreateInstagramContactDialog } from "../instagram/CreateInstagramContactDialog";
import { LeadFilters } from "../LeadFilters";
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
  onEditModeChange?: (isEditMode: boolean) => void;
}

export const LeadsHeader = ({
  searchQuery,
  setSearchQuery,
  selectedPipelineId,
  setSelectedPipelineId,
  viewMode,
  setViewMode,
  onEditModeChange,
}: LeadsHeaderProps) => {
  const [showAddLead, setShowAddLead] = useState(false);
  const [showInstagramDialog, setShowInstagramDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleEditModeToggle = () => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    onEditModeChange?.(newEditMode);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Page Title */}
        <h1 className="text-2xl font-semibold">Kontakte</h1>

        {/* Add Contact and Dropdown Buttons */}
        <div className="flex items-center gap-[1px]">
          <Button
              onClick={() => setShowAddLead(true)}
              className="rounded-r-none"
            >
            Kontakt hinzufügen ✨
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-black text-white hover:bg-black/90 rounded-l-none">
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

        {/* Search Field */}
        <div className="flex-1 max-w-md">
          <LeadSearch value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Pipeline Selection and Edit Mode */}
        <LeadFilters
          selectedPipelineId={selectedPipelineId}
          setSelectedPipelineId={setSelectedPipelineId}
          onEditModeChange={onEditModeChange}
        />

        {/* Edit Mode Button */}
        <Button
          variant={isEditMode ? "default" : "outline"}
          size="icon"
          onClick={handleEditModeToggle}
          className={`h-9 w-9 transition-colors ${
            isEditMode ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
          }`}
          title={isEditMode ? "Bearbeitungsmodus beenden" : "Bearbeitungsmodus aktivieren"}
        >
          <Pencil className="h-4 w-4" />
        </Button>

        {/* View Mode Buttons */}
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