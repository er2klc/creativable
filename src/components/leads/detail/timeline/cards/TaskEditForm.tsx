import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, X } from "lucide-react";

interface TaskEditFormProps {
  id: string;
  title: string;
  onCancel: () => void;
  onSave: () => void;
}

export const TaskEditForm = ({ id, title, onCancel, onSave }: TaskEditFormProps) => {
  const { settings } = useSettings();
  const [editedTitle, setEditedTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          title: editedTitle,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(
        settings?.language === "en" 
          ? "Task updated successfully" 
          : "Aufgabe erfolgreich aktualisiert"
      );
      onSave();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error(
        settings?.language === "en"
          ? "Error updating task"
          : "Fehler beim Aktualisieren der Aufgabe"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        value={editedTitle}
        onChange={(e) => setEditedTitle(e.target.value)}
        className="w-full"
      />
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
        >
          <X className="h-4 w-4 mr-1" />
          {settings?.language === "en" ? "Cancel" : "Abbrechen"}
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || editedTitle.trim() === title.trim()}
        >
          <Save className="h-4 w-4 mr-1" />
          {settings?.language === "en" ? "Save" : "Speichern"}
        </Button>
      </div>
    </div>
  );
};