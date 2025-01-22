import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadWithRelations } from "../types/lead";
import { UseMutateFunction } from "@tanstack/react-query";

interface LeadDetailHeaderProps {
  lead: LeadWithRelations;
  onUpdateLead: UseMutateFunction<any, Error, Partial<LeadWithRelations>, unknown>;
  onClose: () => void;
}

export const LeadDetailHeader = ({ lead, onUpdateLead, onClose }: LeadDetailHeaderProps) => {
  const isOnboardingComplete = lead.status === 'partner' && 
    lead.onboarding_progress && 
    Object.values(lead.onboarding_progress).every(value => value);

  if (!isOnboardingComplete) return null;

  return (
    <div className="p-4 bg-green-50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <span className="font-semibold text-green-700">Onboarding abgeschlossen</span>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        className="text-gray-500 hover:text-gray-700"
        onClick={onClose}
      >
        <ArrowRight className="h-4 w-4 mr-2" />
        Zurück zur Kontakt Page
      </Button>
    </div>
  );
};