import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/use-settings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const noteColors = {
  yellow: 'bg-note-yellow',
  green: 'bg-note-green',
  blue: 'bg-note-blue',
  purple: 'bg-note-purple',
  pink: 'bg-note-pink',
  orange: 'bg-note-orange',
  peach: 'bg-note-peach',
  magenta: 'bg-note-magenta',
  ocean: 'bg-note-ocean',
  primary: 'bg-note-primary',
};

interface LeadNotesProps {
  lead: Tables<"leads">;
}

export function LeadNotes({ lead }: LeadNotesProps) {
  const { settings } = useSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(lead.notes || "");
  const [selectedColor, setSelectedColor] = useState<keyof typeof noteColors>("yellow");

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
        <CardTitle>
          {settings?.language === "en" ? "Notes" : "Notizen"} ({notes ? "1" : "0"})
        </CardTitle>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            {settings?.language === "en" ? "Edit" : "Bearbeiten"}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Select value={selectedColor} onValueChange={(value: keyof typeof noteColors) => setSelectedColor(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(noteColors).map(([color, className]) => (
                  <SelectItem key={color} value={color}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${className}`} />
                      {color}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            className={`min-h-[200px] ${noteColors[selectedColor]}`}
            placeholder={settings?.language === "en" ? "Add notes about this contact..." : "Fügen Sie Notizen zu diesem Kontakt hinzu..."}
          />
        ) : (
          <div className={`whitespace-pre-wrap p-4 rounded-lg ${noteColors[selectedColor]}`}>
            {notes || (settings?.language === "en" ? "No notes added yet." : "Noch keine Notizen hinzugefügt.")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}