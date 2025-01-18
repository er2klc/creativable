import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, GitBranch, Pencil } from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreatePipelineDialog } from "./pipeline/CreatePipelineDialog";
import { EditPipelineDialog } from "./pipeline/EditPipelineDialog";
import { useState } from "react";

interface LeadFiltersProps {
  selectedPipelineId: string | null;
  setSelectedPipelineId: (id: string | null) => void;
}

export const LeadFilters = ({
  selectedPipelineId,
  setSelectedPipelineId,
}: LeadFiltersProps) => {
  const session = useSession();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [hoveredPipeline, setHoveredPipeline] = useState<string | null>(null);

  const { data: pipelines = [] } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", session.user.id)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[200px] justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              {selectedPipeline?.name || "Pipeline wählen"}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          {pipelines.map(pipeline => (
            <DropdownMenuItem 
              key={pipeline.id}
              onMouseEnter={() => setHoveredPipeline(pipeline.id)}
              onMouseLeave={() => setHoveredPipeline(null)}
              onClick={() => setSelectedPipelineId(pipeline.id)}
              className="flex items-center justify-between"
            >
              <span>{pipeline.name}</span>
              {hoveredPipeline === pipeline.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPipelineId(pipeline.id);
                    setShowEditDialog(true);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowCreateDialog(true)}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Pipeline hinzufügen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreatePipelineDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />

      {selectedPipeline && (
        <EditPipelineDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          pipelineId={selectedPipeline.id}
          currentName={selectedPipeline.name}
          orderIndex={selectedPipeline.order_index}
        />
      )}
    </div>
  );
};