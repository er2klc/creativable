import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Sparkles } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface CreatePostDialogProps {
  teamId: string;
  categoryId: string;
}

interface FormValues {
  title: string;
  content: string;
}

export function CreatePostDialog({ teamId, categoryId }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<FormValues>();

  const generateWithAI = async (prompt: string) => {
    try {
      setIsGenerating(true);
      const { data, error } = await supabase.functions.invoke('generate-post-content', {
        body: JSON.stringify({ prompt }),
      });

      if (error) throw error;
      
      form.setValue('content', data.content);
      toast.success("Inhalt wurde generiert!");
    } catch (error: any) {
      console.error("Error generating content:", error);
      toast.error("Fehler beim Generieren des Inhalts");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const { error } = await supabase.from("team_posts").insert({
        team_id: teamId,
        category_id: categoryId,
        title: values.title,
        content: values.content,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;

      toast.success("Beitrag erfolgreich erstellt");
      setOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["team-posts", teamId] });
    } catch (error: any) {
      console.error("Error creating post:", error);
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
                  <div className="space-y-2">
                    <FormControl>
                      <Textarea
                        placeholder="Beschreibe deinen Beitrag..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => generateWithAI(field.value)}
                      disabled={isGenerating}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Mit KI verbessern
                    </Button>
                  </div>
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
}