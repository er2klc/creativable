import { TimelineItem } from "../TimelineItem";
import { TimelineItem as TimelineItemType } from "../TimelineUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";

interface ActivityTimelineProps {
  items: TimelineItemType[];
  onDeletePhaseChange?: (id: string) => void;
}

export const ActivityTimeline = ({ items, onDeletePhaseChange }: ActivityTimelineProps) => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const deleteItemMutation = useMutation({
    mutationFn: async (item: TimelineItemType) => {
      let table = '';
      switch (item.type) {
        case 'task':
          table = 'tasks';
          break;
        case 'appointment':
          table = 'tasks'; // appointments are stored in tasks table
          break;
        case 'note':
          table = 'notes';
          break;
        case 'phase_change':
          if (onDeletePhaseChange) {
            onDeletePhaseChange(item.id);
            return;
          }
          break;
        default:
          throw new Error('Unsupported item type for deletion');
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', item.id);

      if (error) throw error;
    },
    onSuccess: (_, item) => {
      queryClient.invalidateQueries({ queryKey: ["lead"] });
      const message = settings?.language === "en" 
        ? `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} deleted successfully`
        : `${item.type === 'task' ? 'Aufgabe' : item.type === 'appointment' ? 'Termin' : 'Notiz'} erfolgreich gelöscht`;
      toast.success(message);
    },
    onError: (error) => {
      console.error('Error deleting item:', error);
      toast.error(settings?.language === "en" 
        ? "Error deleting item" 
        : "Fehler beim Löschen");
    }
  });

  return (
    <div className="relative space-y-6">
      {/* Timeline line with higher z-index */}
      <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-400 z-0" />
      {items.map(item => (
        <TimelineItem 
          key={item.id} 
          item={item} 
          onDelete={item.type !== 'contact_created' ? 
            () => deleteItemMutation.mutate(item) : 
            undefined
          }
          onEdit={item.type === 'note' ? () => {
            console.log('Edit note:', item.id);
          } : undefined}
        />
      ))}
    </div>
  );
};