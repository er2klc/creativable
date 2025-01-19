import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

interface NoteListProps {
  leadId: string;
}

export const NoteList = ({ leadId }: NoteListProps) => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [newNote, setNewNote] = useState("");
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `lead_id=eq.${leadId}`
        },
        (payload) => {
          console.log('Notes change received:', payload);
          queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, leadId]);

  const createNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from("notes")
        .insert({
          lead_id: leadId,
          content,
          user_id: user?.id,
          color: '#FEF7CD'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      setNewNote("");
      toast.success(
        settings?.language === "en"
          ? "Note added successfully"
          : "Notiz erfolgreich hinzugefügt"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    createNoteMutation.mutate(newNote);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={
            settings?.language === "en"
              ? "Add a note..."
              : "Füge eine Notiz hinzu..."
          }
          className="min-h-[100px]"
        />
        <Button
          type="submit"
          disabled={!newNote.trim() || createNoteMutation.isPending}
        >
          {settings?.language === "en" ? "Add Note" : "Notiz hinzufügen"}
        </Button>
      </form>
    </div>
  );
};