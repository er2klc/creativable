
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, User } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreatePipelineDialog } from "./CreatePipelineDialog";
import { useEffect } from "react";

interface PipelineSelectorProps {
  selectedPipelineId: string | null;
  onPipelineSelect: (id: string) => void;
}

export const PipelineSelector = ({
  selectedPipelineId,
  onPipelineSelect,
}: PipelineSelectorProps) => {
  const { settings } = useSettings();

  const { data: pipelines = [] } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (pipelines.length > 0) {
      // Keine Pipeline ausgewählt oder ausgewählte Pipeline existiert nicht mehr
      if (!selectedPipelineId || !pipelines.some(p => p.id === selectedPipelineId)) {
        const lastSelectedId = settings?.last_selected_pipeline_id;
        
        // Prüfe ob die zuletzt ausgewählte Pipeline noch existiert
        if (lastSelectedId && pipelines.some(p => p.id === lastSelectedId)) {
          onPipelineSelect(lastSelectedId);
        } else {
          // Fallback auf die erste Pipeline
          onPipelineSelect(pipelines[0].id);
        }
      }
    }
  }, [pipelines, settings?.last_selected_pipeline_id, selectedPipelineId, onPipelineSelect]);

  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[200px] justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              {selectedPipeline?.name ||
                (settings?.language === "en" ? "Select Pipeline" : "Pipeline wählen")}
            </div>
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          {pipelines.map((pipeline) => (
            <DropdownMenuItem
              key={pipeline.id}
              onClick={() => onPipelineSelect(pipeline.id)}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              {pipeline.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <CreatePipelineDialog />
    </div>
  );
};
