import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeamOrderButtonsProps {
  teamId: string;
  orderIndex: number;
}

export const TeamOrderButtons = ({ teamId, orderIndex }: TeamOrderButtonsProps) => {
  const queryClient = useQueryClient();

  const updateOrderMutation = useMutation({
    mutationFn: async ({ newIndex }: { newIndex: number }) => {
      const { error } = await supabase
        .from("teams")
        .update({ order_index: newIndex })
        .eq("id", teamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: () => {
      toast.error("Failed to update team order");
    },
  });

  return (
    <div className="absolute top-2 right-2 flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => updateOrderMutation.mutate({ newIndex: orderIndex - 1 })}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => updateOrderMutation.mutate({ newIndex: orderIndex + 1 })}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  );
};