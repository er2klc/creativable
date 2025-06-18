import { useState, useEffect } from "react";
import { NotesSection } from "../NotesSection";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface NotesManagerProps {
  lerninhalteId: string;
}

export const NotesManager = ({ lerninhalteId }: NotesManagerProps) => {
  const [notes, setNotes] = useState("");
  const user = useUser();

  const { data: savedNotes, refetch: refetchNotes } = useQuery({
    queryKey: ['notes', lerninhalteId],
    queryFn: async () => {
      if (!user) return '';
      
      const { data, error } = await supabase
        .from('elevate_lerninhalte_notes')
        .select('content')
        .eq('lerninhalte_id', lerninhalteId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.content || '';
    },
    enabled: !!user
  });

  useEffect(() => {
    setNotes(savedNotes || '');
  }, [savedNotes]);

  const handleSaveNotes = async () => {
    if (!user) {
      toast.error('Sie müssen angemeldet sein, um Notizen zu speichern');
      return;
    }

    try {
      const { data: existingNote } = await supabase
        .from('elevate_lerninhalte_notes')
        .select()
        .eq('lerninhalte_id', lerninhalteId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingNote) {
        await supabase
          .from('elevate_lerninhalte_notes')
          .update({ content: notes })
          .eq('lerninhalte_id', lerninhalteId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('elevate_lerninhalte_notes')
          .insert({ 
            lerninhalte_id: lerninhalteId, 
            content: notes,
            user_id: user.id 
          });
      }

      toast.success('Notizen erfolgreich gespeichert');
      refetchNotes();
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Fehler beim Speichern der Notizen');
    }
  };

  return (
    <div className="col-span-4 h-full">
      <NotesSection
        notes={notes}
        onChange={setNotes}
        onSave={handleSaveNotes}
      />
    </div>
  );
};