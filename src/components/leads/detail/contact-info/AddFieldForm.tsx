import { useState } from "react";
import { Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { useContactFields } from "@/hooks/use-contact-fields";

interface AddFieldFormProps {
  groupName: string;
  onComplete: () => void;
}

export function AddFieldForm({ groupName, onComplete }: AddFieldFormProps) {
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const { addField } = useContactFields();
  const { settings } = useSettings();

  const handleSaveNewField = async () => {
    if (newFieldLabel.trim()) {
      try {
        await addField({
          field_name: newFieldLabel,
          field_group: groupName,
          field_type: 'text'
        });
        onComplete();
        setNewFieldLabel("");
        toast.success(
          settings?.language === "en"
            ? "Field added successfully"
            : "Feld erfolgreich hinzugefügt"
        );
      } catch (error) {
        toast.error(
          settings?.language === "en"
            ? "Error saving field"
            : "Fehler beim Speichern des Feldes"
        );
      }
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3 w-full">
        <Settings className="h-4 w-4 text-gray-500 shrink-0" />
        <Input
          value={newFieldLabel}
          onChange={(e) => setNewFieldLabel(e.target.value)}
          onBlur={handleSaveNewField}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSaveNewField();
            }
          }}
          placeholder={settings?.language === "en" ? "Field name" : "Feldname"}
          className="h-8 text-sm bg-white"
          autoFocus
        />
      </div>
    </div>
  );
}