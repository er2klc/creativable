import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { Platform } from "@/config/platforms";

interface NoteListProps {
  leadId: string;
}

type LeadWithRelations = Tables<"leads"> & {
  platform: Platform;
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Tables<"notes">[];
};

export const NoteList = ({ leadId }: NoteListProps) => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [newNote, setNewNote] = useState("");
  const queryClient = useQueryClient();

  const createNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from("notes")
        .insert({
          lead_id: leadId,
          content,
          user_id: user?.id
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
    onError: (error) => {
      toast.error(
        settings?.language === "en"
          ? "Error adding note"
          : "Fehler beim Hinzufügen der Notiz"
      );
    }
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