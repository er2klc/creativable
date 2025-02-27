
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { LeadWithRelations } from "@/types/leads";
import { useSocialMediaPosts } from "./hooks/useSocialMediaPosts";
import { ActivityTimeline } from "./timeline/components/ActivityTimeline";
import { SocialTimeline } from "./timeline/components/SocialTimeline";
import { TimelineHeader } from "./timeline/TimelineHeader";
import { 
  mapNoteToTimelineItem, 
  mapTaskToTimelineItem, 
  mapMessageToTimelineItem, 
  mapFileToTimelineItem,
  createContactCreationItem,
  createStatusChangeItem 
} from "./timeline/utils/timelineMappers";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { PhaseAnalysisButton } from "./components/PhaseAnalysisButton";

interface LeadTimelineProps {
  lead: LeadWithRelations;
  onDeletePhaseChange?: (noteId: string) => void;
}

export const LeadTimeline = ({ lead, onDeletePhaseChange }: LeadTimelineProps) => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [activeTimeline, setActiveTimeline] = useState<'activities' | 'social'>('activities');
  const { data: socialMediaPosts } = useSocialMediaPosts(lead.id);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const queryClient = useQueryClient();
  
  console.log("DEBUG - LeadTimeline render:", {
    leadId: lead.id,
    hasLinkedInPosts: Array.isArray(lead.linkedin_posts) && lead.linkedin_posts.length > 0,
    linkedInPostsData: lead.linkedin_posts,
    socialMediaPosts: socialMediaPosts?.length || 0,
    activeTimeline,
    timestamp: new Date().toISOString()
  });

  const hasLinkedInPosts = Array.isArray(lead.linkedin_posts) && lead.linkedin_posts.length > 0;
  const hasSocialPosts = Array.isArray(socialMediaPosts) && socialMediaPosts.length > 0;
  const hasInstagramData = lead.apify_instagram_data && 
    (typeof lead.apify_instagram_data === 'object' || 
     Array.isArray(JSON.parse(typeof lead.apify_instagram_data === 'string' ? lead.apify_instagram_data : '[]')));
  const showSocialTimeline = hasLinkedInPosts || hasSocialPosts || hasInstagramData;

  const generateAnalysis = async () => {
    if (!user) {
      toast.error(
        settings?.language === "en"
          ? "You must be logged in"
          : "Sie müssen angemeldet sein"
      );
      return;
    }

    if (!lead.phase_id) {
      toast.error(
        settings?.language === "en"
          ? "Lead must be assigned to a phase"
          : "Kontakt muss einer Phase zugeordnet sein"
      );
      return;
    }

    try {
      setIsGeneratingAnalysis(true);
      
      const { data, error } = await supabase.functions.invoke('generate-phase-analysis', {
        body: {
          leadId: lead.id,
          phaseId: lead.phase_id,
          userId: user.id
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }
      
      if (data.error) {
        console.error("Analysis generation error:", data.error);
        toast.error(data.error);
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      queryClient.invalidateQueries({ queryKey: ["lead-with-relations", lead.id] });
      
      toast.success(
        settings?.language === "en"
          ? "Analysis generated successfully"
          : "Analyse erfolgreich generiert"
      );
    } catch (error: any) {
      console.error("Error generating analysis:", error);
      toast.error(
        settings?.language === "en"
          ? `Error generating analysis: ${error.message || "Please try again"}`
          : `Fehler beim Generieren der Analyse: ${error.message || "Bitte versuchen Sie es erneut"}`
      );
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  const statusChangeItem = createStatusChangeItem(
    lead.status || 'lead',
    lead.updated_at || lead.created_at || new Date().toISOString()
  );

  const allActivities = [
    ...(statusChangeItem ? [statusChangeItem] : []),
    ...(lead.notes || []).map(mapNoteToTimelineItem),
    ...(lead.tasks || []).map(mapTaskToTimelineItem),
    ...(lead.messages || []).map(mapMessageToTimelineItem),
    ...(lead.lead_files || []).map(mapFileToTimelineItem),
    createContactCreationItem(lead.name, lead.created_at)
  ];

  const timelineItems = allActivities.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      <TimelineHeader 
        title={activeTimeline === 'activities' ? 
          (settings?.language === "en" ? "Activities" : "Aktivitäten") :
          (settings?.language === "en" ? "Social Media Activities" : "Social Media Aktivitäten")
        }
        showSocialTimeline={showSocialTimeline}
        activeTimeline={activeTimeline}
        onTimelineChange={setActiveTimeline}
        platform={lead.platform}
        hasLinkedInPosts={hasLinkedInPosts}
      />

      {lead.phase_id && (
        <PhaseAnalysisButton 
          isLoading={isGeneratingAnalysis}
          leadId={lead.id}
          phaseId={lead.phase_id}
          onGenerateAnalysis={generateAnalysis}
        />
      )}

      {activeTimeline === 'activities' ? (
        <ActivityTimeline 
          items={timelineItems}
          onDeletePhaseChange={onDeletePhaseChange}
        />
      ) : (
        <SocialTimeline 
          platform={lead.platform}
          hasLinkedInPosts={hasLinkedInPosts}
          linkedInPosts={lead.linkedin_posts || []}
          socialMediaPosts={socialMediaPosts || []}
          leadId={lead.id}
        />
      )}
    </div>
  );
};
