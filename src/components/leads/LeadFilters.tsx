import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, Pipeline } from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreatePipelineDialog } from "./pipeline/CreatePipelineDialog";
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

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[200px] justify-between">
            <div className="flex items-center gap-2">
              <Pipeline className="h-4 w-4" />
              {pipelines.find(p => p.id === selectedPipelineId)?.name || "Pipeline wählen"}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          {pipelines.map(pipeline => (
            <DropdownMenuItem 
              key={pipeline.id}
              onClick={() => setSelectedPipelineId(pipeline.id)}
            >
              {pipeline.name}
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
    </div>
  );
};