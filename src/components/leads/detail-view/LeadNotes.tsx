import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/use-settings";

interface LeadNotesProps {
  lead: Tables<"leads">;
}

export function LeadNotes({ lead }: LeadNotesProps) {
  const { settings } = useSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(lead.notes || "");

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ notes })
        .eq("id", lead.id);

      if (error) throw error;

      toast({
        title: settings?.language === "en" ? "Success" : "Erfolg",
        description: settings?.language === "en" ? "Notes updated successfully" : "Notizen erfolgreich aktualisiert",
      });

      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating notes:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en" ? "Failed to update notes" : "Fehler beim Aktualisieren der Notizen",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{settings?.language === "en" ? "Notes" : "Notizen"}</CardTitle>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            {settings?.language === "en" ? "Edit" : "Bearbeiten"}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              {settings?.language === "en" ? "Cancel" : "Abbrechen"}
            </Button>
            <Button onClick={handleSave}>
              {settings?.language === "en" ? "Save" : "Speichern"}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[200px]"
            placeholder={settings?.language === "en" ? "Add notes about this contact..." : "Fügen Sie Notizen zu diesem Kontakt hinzu..."}
          />
        ) : (
          <div className="whitespace-pre-wrap">
            {notes || (settings?.language === "en" ? "No notes added yet." : "Noch keine Notizen hinzugefügt.")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}