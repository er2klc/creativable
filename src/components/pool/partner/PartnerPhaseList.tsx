
import { Tables } from "@/integrations/supabase/types";
import { LeadTableView } from "@/components/leads/LeadTableView";

interface PartnerPhaseListProps {
  leads: Tables<"leads">[];
  onLeadClick: (id: string) => void;
}

export const PartnerPhaseList = ({ leads, onLeadClick }: PartnerPhaseListProps) => {
  const getPartnerLeadsByPhase = (phase: string) => {
    return leads.filter(lead => {
      const progress = lead.onboarding_progress as any;
      switch(phase) {
        case 'start':
          return !progress?.training_provided;
        case 'goals':
          return progress?.training_provided && !progress?.team_invited;
        case 'presentation':
          return progress?.team_invited;
        default:
          return true;
      }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Start & Setup</h3>
        <LeadTableView 
          leads={getPartnerLeadsByPhase('start')}
          onLeadClick={onLeadClick}
          selectedPipelineId={null}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Ziele & Kontakte</h3>
        <LeadTableView 
          leads={getPartnerLeadsByPhase('goals')}
          onLeadClick={onLeadClick}
          selectedPipelineId={null}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Präsentation & Abschluss</h3>
        <LeadTableView 
          leads={getPartnerLeadsByPhase('presentation')}
          onLeadClick={onLeadClick}
          selectedPipelineId={null}
        />
      </div>
    </div>
  );
};
