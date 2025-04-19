
import { useState, useEffect } from "react";
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
  mapBusinessMatchToTimelineItem,
  createContactCreationItem,
  createStatusChangeItem 
} from "./timeline/utils/timelineMappers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface LeadTimelineProps {
  lead: LeadWithRelations;
  onDeletePhaseChange?: (noteId: string) => void;
}

export const LeadTimeline = ({ lead, onDeletePhaseChange }: LeadTimelineProps) => {
  const { settings } = useSettings();
  const [activeTimeline, setActiveTimeline] = useState<'activities' | 'social'>('activities');
  const { data: socialMediaPosts } = useSocialMediaPosts(lead.id);
  const [tasks, setTasks] = useState(lead.tasks || []);
  const queryClient = useQueryClient();
  
  // Update local tasks when lead tasks change
  useEffect(() => {
    if (lead.tasks) {
      setTasks(lead.tasks);
    }
  }, [lead.tasks]);
  
  // Set up realtime subscription to tasks
  useEffect(() => {
    const taskChannel = supabase
      .channel(`tasks-${lead.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `lead_id=eq.${lead.id}`
      }, () => {
        // When tasks change, invalidate queries
        queryClient.invalidateQueries({ queryKey: ['lead', lead.id] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(taskChannel);
    };
  }, [lead.id, queryClient]);
  
  const hasLinkedInPosts = Array.isArray(lead.linkedin_posts) && lead.linkedin_posts.length > 0;
  const hasSocialPosts = Array.isArray(socialMediaPosts) && socialMediaPosts.length > 0;
  const hasInstagramData = lead.apify_instagram_data && 
    (typeof lead.apify_instagram_data === 'object' || 
     Array.isArray(JSON.parse(typeof lead.apify_instagram_data === 'string' ? lead.apify_instagram_data : '[]')));
  const showSocialTimeline = hasLinkedInPosts || hasSocialPosts || hasInstagramData;

  const statusChangeItem = createStatusChangeItem(
    lead.status || 'lead',
    lead.updated_at || lead.created_at || new Date().toISOString()
  );

  // Holen der Business Match-Daten, falls vorhanden
  const businessMatchItems = lead.business_match ? 
    [(lead.business_match as any && mapBusinessMatchToTimelineItem(lead.business_match as any))] : 
    [];

  // Handle task completion toggle
  const handleToggleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      // Update local state for immediate UI feedback
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ));
      
      // Update in database
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['lead', lead.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
    } catch (error) {
      console.error("Error toggling task completion:", error);
      toast.error(
        settings?.language === "en" 
          ? "Failed to update task" 
          : "Fehler beim Aktualisieren der Aufgabe"
      );
      
      // Revert local state on error
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !completed } : task
      ));
    }
  };

  const allActivities = [
    ...businessMatchItems.filter(Boolean),
    ...(statusChangeItem ? [statusChangeItem] : []),
    ...(lead.notes || []).map(mapNoteToTimelineItem),
    ...(tasks || []).map(mapTaskToTimelineItem),
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

      {activeTimeline === 'activities' ? (
        <ActivityTimeline 
          items={timelineItems}
          onDeletePhaseChange={onDeletePhaseChange}
          onToggleTaskComplete={handleToggleTaskComplete}
          leadName={lead.name}
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
