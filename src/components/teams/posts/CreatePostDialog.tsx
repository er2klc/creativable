
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface FormValues {
  title: string;
  content: string;
}

interface CreatePostDialogProps {
  teamId: string;
  categoryId: string;
}

export const CreatePostDialog = ({ teamId, categoryId }: CreatePostDialogProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<FormValues>();

  // Fetch team members for @mentions
  const { data: teamMembers } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          user_id,
          profiles:user_id (
            id,
            display_name
          )
        `)
        .eq('team_id', teamId);

      if (error) throw error;
      return data;
    },
  });

  const extractMentions = (content: string) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex) || [];
    return mentions.map(mention => mention.substring(1));
  };

  const findUserIdByName = (name: string) => {
    const member = teamMembers?.find(
      m => m.profiles?.display_name?.toLowerCase() === name.toLowerCase()
    );
    return member?.profiles?.id;
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const mentions = extractMentions(values.content);
      const mentionedUserIds = mentions
        .map(name => findUserIdByName(name))
        .filter((id): id is string => id !== undefined);

      // Insert the post
      const { data: post, error: postError } = await supabase
        .from('team_posts')
        .insert({
          team_id: teamId,
          category_id: categoryId,
          title: values.title,
          content: values.content,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select('id')
        .single();

      if (postError) throw postError;

      // Insert mentions if any
      if (mentionedUserIds.length > 0) {
        const { error: mentionsError } = await supabase
          .from('team_post_mentions')
          .insert(
            mentionedUserIds.map(userId => ({
              post_id: post.id,
              mentioned_user_id: userId,
            }))
          );

        if (mentionsError) throw mentionsError;
      }

      toast.success("Beitrag erfolgreich erstellt");
      setOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['team-posts'] });
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error("Fehler beim Erstellen des Beitrags");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Beitrag
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neuen Beitrag erstellen</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel</FormLabel>
                  <FormControl>
                    <Input placeholder="Titel des Beitrags" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inhalt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beschreibe deinen Beitrag... (@mention für Erwähnungen)"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">Erstellen</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
