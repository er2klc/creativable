import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { LeadWithRelations } from "@/types/leads";
import { StatusButtons } from "./header/StatusButtons";
import { LeadName } from "./header/LeadName";
import { VerticalPhaseTimeline } from "./header/VerticalPhaseTimeline";

interface LeadDetailHeaderProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
  onDeleteLead: () => void;
}

export const LeadDetailHeader = ({
  lead,
  onUpdateLead,
  onDeleteLead,
}: LeadDetailHeaderProps) => {
  const { settings } = useSettings();

  return (
    <div className="border-b">
      <div className="flex items-start justify-between p-6">
        <div className="space-y-4 flex-1">
          <LeadName lead={lead} onUpdateLead={onUpdateLead} />
          <StatusButtons
            status={lead.status || "lead"}
            onStatusChange={(newStatus) => onUpdateLead({ status: newStatus })}
          />
        </div>
        {lead.status === "partner" && lead.pipeline_id && (
          <div className="ml-6 border-l pl-6">
            <VerticalPhaseTimeline 
              currentPhaseId={lead.phase_id || ""} 
              pipelineId={lead.pipeline_id} 
            />
          </div>
        )}
      </div>
    </div>
  );
};