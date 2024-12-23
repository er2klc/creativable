import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

interface NoteListProps {
  leadId: string;
}

export function NoteList({ leadId }: NoteListProps) {
  const { settings } = useSettings();
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedColor, setSelectedColor] = useState("#FEF7CD");
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["lead-notes", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from("notes")
        .insert({
          lead_id: leadId,
          content,
          color: selectedColor,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-notes", leadId] });
      setNewNoteContent("");
      toast.success(settings?.language === "en" ? "Note added" : "Notiz hinzugefügt");
    },
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNoteContent.trim()) {
      addNoteMutation.mutate(newNoteContent);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {settings?.language === "en" ? "Notes" : "Notizen"} ({notes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddNote} className="flex flex-col gap-2 mb-4">
          <Textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder={settings?.language === "en" ? "New note..." : "Neue Notiz..."}
            className="resize-none"
          />
          <div className="flex gap-2">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <Button type="submit" className="ml-auto">
              <Plus className="h-4 w-4 mr-2" />
              {settings?.language === "en" ? "Add Note" : "Notiz hinzufügen"}
            </Button>
          </div>
        </form>
        <div className="grid gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-lg shadow transform rotate-1 transition-transform hover:rotate-0"
              style={{ backgroundColor: note.color || "#FEF7CD" }}
            >
              <p className="whitespace-pre-wrap">{note.content}</p>
              <div className="text-xs text-gray-500 mt-2">
                {new Date(note.created_at || "").toLocaleString(
                  settings?.language === "en" ? "en-US" : "de-DE",
                  {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}