import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";

interface NoteTabProps {
  leadId: string;
}

export const NoteTab = ({ leadId }: NoteTabProps) => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [newNote, setNewNote] = useState("");

  const handleAddNote = async () => {
    const { error } = await supabase
      .from("notes")
      .insert({
        lead_id: leadId,
        content: newNote,
        color: '#FEF7CD',
        user_id: user?.id,
      });

    if (error) {
      console.error("Error adding note:", error);
      return;
    }

    setNewNote("");
    toast.success(settings?.language === "en" ? "Note added" : "Notiz hinzugefügt");
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>
          {settings?.language === "en" ? "Add Note" : "Notiz hinzufügen"}
        </Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder={settings?.language === "en" ? "Enter note..." : "Notiz eingeben..."}
          />
          <Button onClick={handleAddNote}>
            {settings?.language === "en" ? "Add" : "Hinzufügen"}
          </Button>
        </div>
      </div>
    </div>
  );
};