
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LeadTimelineProps {
  lead: LeadWithRelations;
  onDeletePhaseChange?: (noteId: string) => void;
}

export const LeadTimeline = ({ lead, onDeletePhaseChange }: LeadTimelineProps) => {
  const { settings } = useSettings();
  const [activeTimeline, setActiveTimeline] = useState<'activities' | 'social'>('activities');
  const { data: socialMediaPosts } = useSocialMediaPosts(lead.id);
  const [tasks, setTasks] = useState(lead.tasks || []);
  
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

  // Handle task completion toggle
  const handleToggleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      // Update local state for immediate UI feedback
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ));
      
      // Update in database (the TaskCard component already does this, 
      // so this is just for consistency in case we need to do more than just toggle)
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);
        
      if (error) throw error;
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
        />
      ) : (
        <SocialTimeline 
          platform={lead.platform}
          hasLinkedInPosts={hasLinkedInPosts}
          linkedInPosts={lead.linkedin_posts || []}
          socialMediaPosts={socialMediaPosts || [