
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { UseFormReturn } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ContentFieldProps {
  form: UseFormReturn<any>;
  teamMembers?: any[];
  preventSubmitOnEnter?: boolean;
  isAdmin?: boolean;
  teamId?: string;
}

export const ContentField = ({ 
  form, 
  teamMembers, 
  preventSubmitOnEnter = false, 
  isAdmin = false,
  teamId 
}: ContentFieldProps) => {
  const { data: enrichedTeamMembers } = useQuery({
    queryKey: ['team-members-with-levels', teamId],
    queryFn: async () => {
      if (!teamMembers?.length) return [];
      
      const { data: memberPoints } = await supabase
        .from('team_member_points')
        .select('user_id, level')
        .eq('team_id', teamId)
        .in('user_id', teamMembers.map(m => m.id));

      return teamMembers.map(member => ({
        ...member,
        level: memberPoints?.find(mp => mp.user_id === member.id)?.level || 1
      }));
    },
    enabled: !!teamId && !!teamMembers?.length
  });

  return (
    <FormField
      control={form.control}
      name="content"
      rules={{ required: "Inhalt ist erforderlich" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Inhalt</FormLabel>
          <FormControl>
            <TiptapEditor
              content={field.value}
              onChange={field.onChange}
              placeholder="Beschreibe deinen Beitrag... (@mention für Erwähnungen)"
              teamMembers={enrichedTeamMembers}
              onMention={(userId) => {
                console.log('Mentioned user:', userId);
              }}
              onHashtag={(tag) => {
                console.log('Added hashtag:', tag);
              }}
              preventSubmitOnEnter={preventSubmitOnEnter}
              editorProps={{
                handleKeyDown: (view, event) => {
                  if (event.ctrlKey || event.metaKey) {
                    event.stopPropagation();
                  }
                }
              }}
              isAdmin={isAdmin}
              teamId={teamId}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
