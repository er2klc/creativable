
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FormValues {
  title: string;
  content: string;
  files?: FileList;
}

interface CreatePostFormProps {
  teamId: string;
  categoryId?: string;
  onSuccess: () => void;
  teamMembers?: any[];
}

export const CreatePostForm = ({ teamId, categoryId, onSuccess, teamMembers }: CreatePostFormProps) => {
  const form = useForm<FormValues>();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileUpload = async (files: FileList | null): Promise<string[]> => {
    if (!files || files.length === 0) return [];
    
    const fileUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${teamId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('team-files')
        .upload(filePath, file);
        
      if (uploadError) {
        toast.error(`Fehler beim Hochladen von ${file.name}`);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('team-files')
        .getPublicUrl(filePath);
        
      fileUrls.push(publicUrl);
    }
    
    return fileUrls;
  };

  const onSubmit = async (values: FormValues) => {
    setIsUploading(true);
    try {
      const mentions = extractMentions(values.content);
      const mentionedUserIds = mentions
        .map(name => findUserIdByName(name))
        .filter((id): id is string => id !== undefined);

      const fileUrls = values.files ? await handleFileUpload(values.files) : [];

      const { data: post, error: postError } = await supabase
        .from('team_posts')
        .insert({
          team_id: teamId,
          category_id: categoryId,
          title: values.title,
          content: values.content,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          file_urls: fileUrls.length > 0 ? fileUrls : null,
        })
        .select('id')
        .single();

      if (postError) throw postError;

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
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['team-posts'] });
      onSuccess();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error("Fehler beim Erstellen des Beitrags");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          rules={{ required: "Titel ist erforderlich" }}
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
          rules={{ required: "Inhalt ist erforderlich" }}
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
        <FormField
          control={form.control}
          name="files"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Dateien anhängen</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                  className="cursor-pointer"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isUploading}>
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Wird hochgeladen...
              </>
            ) : (
              'Erstellen'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
