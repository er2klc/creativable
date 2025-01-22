import { Bot, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { LeadInfoCard } from "../LeadInfoCard";
import { TaskList } from "../TaskList";
import { NoteList } from "../NoteList";
import { LeadSummary } from "../LeadSummary";
import { LeadMessages } from "../LeadMessages";
import { CompactPhaseSelector } from "../CompactPhaseSelector";
import { LeadTimeline } from "../LeadTimeline";
import { ContactFieldManager } from "../contact-info/ContactFieldManager";
import { LeadWithRelations } from "../types/lead";

interface LeadDetailContentProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<LeadWithRelations>) => void;
  onShowDeleteDialog: () => void;
}

export const LeadDetailContent = ({ 
  lead, 
  onUpdateLead,
  onShowDeleteDialog 
}: LeadDetailContentProps) => {
  const { settings } = useSettings();

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        <CompactPhaseSelector
          lead={lead}
          onUpdateLead={onUpdateLead}
        />
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <h3 className="text-lg font-semibold">
              {settings?.language === "en" ? "AI Summary" : "KI-Zusammenfassung"}
            </h3>
          </div>
          <LeadSummary lead={lead} />
        </div>
        
        <LeadInfoCard lead={lead} />
        <ContactFieldManager />
        <LeadTimeline lead={lead} />
        <TaskList leadId={lead.id} />
        <NoteList leadId={lead.id} />
        <LeadMessages leadId={lead.id} messages={lead.messages} />

        {/* Delete Button */}
        <div className="absolute bottom-4 left-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-600"
            onClick={onShowDeleteDialog}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};