import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/use-settings";
import { PipelineSelector } from "../pipeline/PipelineSelector";
import { Plus, Instagram, Linkedin, Facebook, Video } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Platform } from "@/config/platforms";

interface KanbanHeaderProps {
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  editingPipelineName: string;
  onEditingPipelineNameChange: (name: string) => void;
  onSaveChanges: () => void;
  selectedPipelineId: string | null;
  onPipelineSelect: (id: string) => void;
  onShowAddLead: (platform?: Platform) => void;
}

export const KanbanHeader = ({
  isEditMode,
  setIsEditMode,
  editingPipelineName,
  onEditingPipelineNameChange,
  onSaveChanges,
  selectedPipelineId,
  onPipelineSelect,
  onShowAddLead,
}: KanbanHeaderProps) => {
  const { settings } = useSettings();

  return (
    <div className="flex items-center justify-between p-4 bg-background sticky top-0 z-20 border-b">
      <div className="flex items-center gap-4">
        <PipelineSelector
          selectedPipelineId={selectedPipelineId}
          onPipelineSelect={onPipelineSelect}
        />
        {isEditMode ? (
          <div className="flex items-center gap-2">
            <Input
              value={editingPipelineName}
              onChange={(e) => onEditingPipelineNameChange(e.target.value)}
              placeholder={settings?.language === "en" ? "Pipeline Name" : "Name der Pipeline"}
              className="w-[200px]"
            />
            <Button onClick={onSaveChanges}>
              {settings?.language === "en" ? "Save Changes" : "Änderungen speichern"}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsEditMode(true)}
          >
            {settings?.language === "en" ? "Edit Pipeline" : "Pipeline bearbeiten"}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => onShowAddLead()}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {settings?.language === "en" ? "Add Contact" : "Kontakt hinzufügen"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              {settings?.language === "en" ? "From Social" : "Von Social Media"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] bg-background">
            <DropdownMenuItem onClick={() => onShowAddLead("Instagram")}>
              <Instagram className="h-4 w-4 mr-2" />
              Instagram
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShowAddLead("LinkedIn")}>
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShowAddLead("Facebook")}>
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShowAddLead("TikTok")}>
              <Video className="h-4 w-4 mr-2" />
              TikTok
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};