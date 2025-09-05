
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { LeadInfoCard } from "./LeadInfoCard";
import { LeadTimeline } from "./LeadTimeline";
import { ContactFieldManager } from "./contact-info/ContactFieldManager";
import { LeadWithRelations } from "@/types/leads";
import { LeadDetailTabs } from "./LeadDetailTabs";
import { useEffect, useState } from "react";
import { PhaseAnalysisButton } from "./components/PhaseAnalysisButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface LeadDetailContentProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
  isLoading: boolean;
  onDeleteClick?: () => void;
  onDeletePhaseChange?: (noteId: string) => void;
}

export const LeadDetailContent = ({ 
  lead, 
  onUpdateLead,
  isLoading,
  onDeleteClick,
  onDeletePhaseChange
}: LeadDetailContentProps) => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);

  useEffect(() => {
    if (lead.phase_id) {
      checkExistingAnalysis();
    }
  }, [lead.phase_id, lead.id]);

  const checkExistingAnalysis = async () => {
    if (!lead.phase_id) return;
    
    const { data } = await supabase
      .from("phase_based_analyses")
      .select("*")
      .eq("lead_id", lead.id)
      .eq("phase_id", lead.phase_id)
      .maybeSingle();
    
    setHasAnalysis(!!data);
  };

  const generateAnalysis = async () => {
    if (!user) {
      return;
    }

    if (!lead.phase_id) {
      return;
    }

    try {
      setIsGeneratingAnalysis(true);
      
      // Verwende die neue Edge Function
      const { data, error } = await supabase.functions.invoke('generate-lead-phase-analysis', {
        body: {
          leadId: lead.id,
          phaseId: lead.phase_id,
          userId: user.id
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error(settings?.language === "en" 
          ? `Analysis generation failed: ${error.message}` 
          : `Fehler bei der Analyse-Generierung: ${error.message}`);
        throw error;
      }
      
      if (data.error) {
        console.error("Analysis generation error:", data.error);
        toast.error(settings?.language === "en" 
          ? `Analysis generation failed: ${data.error}` 
          : `Fehler bei der Analyse-Generierung: ${data.error}`);
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      queryClient.invalidateQueries({ queryKey: ["lead-with-relations", lead.id] });
      setHasAnalysis(true);
      
      toast.success(settings?.language === "en" 
        ? "Phase analysis created successfully" 
        : "Phasenanalyse erfolgreich erstellt");
    } catch (error: any) {
      console.error("Error generating analysis:", error);
      toast.error(settings?.language === "en" 
        ? `Error generating analysis: ${error.message}` 
        : `Fehler bei der Analyse-Generierung: ${error.message}`);
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">{settings?.language === "en" ? "Loading..." : "Lädt..."}</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-12 gap-6 p-6 bg-gray-50 min-h-[calc(100vh-10rem)] mt-32">
        {/* Left Column - 4/12 */}
        <div className="col-span-4 space-y-6">
          {lead.phase_id && !hasAnalysis && (
            <PhaseAnalysisButton 
              isLoading={isGeneratingAnalysis}
              leadId={lead.id}
              phaseId={lead.phase_id}
              onGenerateAnalysis={generateAnalysis}
            />
          )}
          <LeadInfoCard 
            lead={lead as any} 
            onUpdate={(updates) => {
              // Only call onUpdateLead if we're actually changing something
              const hasChanges = Object.entries(updates).some(
                ([key, value]) => lead[key as keyof typeof lead] !== value
              );
              if (hasChanges) {
                onUpdateLead(updates);
              }
            }} 
            onDelete={onDeleteClick}
          />
        </div>

        {/* Right Column - 8/12 */}
        <div className="col-span-8 space-y-6">
          <ContactFieldManager />
          <LeadDetailTabs lead={lead as any} />
          <LeadTimeline 
            lead={lead as any} 
            onDeletePhaseChange={onDeletePhaseChange}
          />
        </div>
      </div>
    </div>
  );
};
