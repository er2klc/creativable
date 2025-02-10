
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { UseFormReturn } from "react-hook-form";

interface ContentFieldProps {
  form: UseFormReturn<any>;
  teamMembers?: any[];
}

export const ContentField = ({ form, teamMembers }: ContentFieldProps) => {
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
              teamMembers={teamMembers}
              onMention={(userId) => {
                console.log('Mentioned user:', userId);
              }}
              onHashtag={(tag) => {
                console.log('Added hashtag:', tag);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
