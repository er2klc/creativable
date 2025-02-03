import { useDroppable } from "@dnd-kit/core";
import { Tables } from "@/integrations/supabase/types";
import { SortableLeadItem } from "./SortableLeadItem";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Instagram, Linkedin, Facebook, Video, Users, Trash2 } from "lucide-react";
import { useState } from "react";
import { AddLeadButton } from "./AddLeadButton";

interface PhaseColumnProps {
  phase: Tables<"pipeline_phases">;
  leads: Tables<"leads">[];
  onLeadClick: (id: string) => void;
  isEditMode: boolean;
  onDeletePhase: () => void;
  onUpdatePhaseName: (newName: string) => void;
  pipelineId: string | null;
  isFirst?: boolean;
  isLast?: boolean;
  onMovePhase?: (direction: 'left' | 'right') => void;
}

export const PhaseColumn = ({ 
  phase, 
  leads, 
  onLeadClick,
  isEditMode,
  onDeletePhase,
  onUpdatePhaseName,
  pipelineId,
  isFirst = false,
  isLast = false,
  onMovePhase
}: PhaseColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: phase.id,
    disabled: isEditMode,
  });

  const [editingName, setEditingName] = useState(phase.name);
  const [isHovered, setIsHovered] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
    onUpdatePhaseName(e.target.value);
  };

  // Group leads by platform and count them
  const platformCounts = leads.reduce((acc, lead) => {
    const platform = lead.platform.toLowerCase();
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      case "tiktok":
        return <Video className="h-4 w-4" />;
      case "offline":
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "instagram":
        return "text-pink-500";
      case "linkedin":
        return "text-blue-600";
      case "facebook":
        return "text-blue-500";
      case "tiktok":
        return "text-gray-900";
      case "offline":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card
      ref={setNodeRef}
      className={`h-full flex flex-col bg-muted/50 rounded-lg relative transition-colors duration-200 ${
        isOver && !isEditMode ? 'ring-2 ring-primary/50 bg-primary/5 shadow-[0_-2px_4px_rgba(0,0,0,0.15)]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-2 space-y-0 sticky top-0 bg-muted/50 backdrop-blur-sm z-40 border-b shadow-sm">
        <div className="flex items-center justify-between gap-2">
          {isEditMode ? (
            <>
              <div className="flex items-center gap-2 flex-1">
                {!isFirst && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMovePhase?.('left')}
                    className="h-8 w-8 hover:bg-primary/10"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <Input
                  value={editingName}
                  onChange={handleNameChange}
                  className="h-8"
                />
                {!isLast && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMovePhase?.('right')}
                    className="h-8 w-8 hover:bg-primary/10"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDeletePhase}
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="w-full">
              <h3 className="font-medium text-sm tracking-tight mb-2">{phase.name}</h3>
              {Object.entries(platformCounts).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(platformCounts).map(([platform, count]) => (
                    <div 
                      key={platform}
                      className="flex items-center gap-1 text-xs"
                    >
                      <span className={getPlatformColor(platform)}>
                        {getPlatformIcon(platform)}
                      </span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <div className="flex-1 overflow-y-auto no-scrollbar max-h-[calc(100vh-12rem)]">
        <div className="space-y-2 p-4">
          {leads.map((lead) => (
            <SortableLeadItem
              key={lead.id}
              lead={lead}
              onLeadClick={onLeadClick}
              disabled={isEditMode}
            />
          ))}
          {isHovered && !isEditMode && (
            <AddLeadButton phase={phase.id} pipelineId={pipelineId} />
          )}
        </div>
      </div>
    </Card>
  );
};