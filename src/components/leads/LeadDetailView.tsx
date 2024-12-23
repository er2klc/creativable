import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { useSettings } from "@/hooks/use-settings";
import { LeadBasicInfo } from "./detail-view/LeadBasicInfo";
import { LeadNotes } from "./detail-view/LeadNotes";
import { LeadMessages } from "./detail-view/LeadMessages";
import { LeadTasks } from "./detail-view/LeadTasks";

interface LeadDetailViewProps {
  leadId: string | null;
  onClose: () => void;
}

export const LeadDetailView = ({ leadId, onClose }: LeadDetailViewProps) => {
  const { settings } = useSettings();
  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId) return null;
      const { data, error } = await supabase
        .from("leads")
        .select("*, messages(*), tasks(*)")
        .eq("id", leadId)
        .single();

      if (error) throw error;
      return data as Tables<"leads"> & {
        messages: Tables<"messages">[];
        tasks: Tables<"tasks">[];
      };
    },
    enabled: !!leadId,
  });

  return (
    <Dialog open={!!leadId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{lead?.name}</DialogTitle>
          {lead && (
            <SendMessageDialog
              lead={lead}
              trigger={
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  {settings?.language === "en" ? "Send Message" : "Nachricht senden"}
                </Button>
              }
            />
          )}
        </DialogHeader>

        {isLoading ? (
          <div>{settings?.language === "en" ? "Loading..." : "Lädt..."}</div>
        ) : lead ? (
          <div className="grid gap-6">
            <LeadBasicInfo lead={lead} />
            <LeadMessages messages={lead.messages} />
            <LeadNotes lead={lead} />
            <LeadTasks tasks={lead.tasks} />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};