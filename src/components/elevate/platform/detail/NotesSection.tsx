import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StickyNote, Save } from "lucide-react";

interface NotesSectionProps {
  notes: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

export const NotesSection = ({ notes, onChange, onSave }: NotesSectionProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Label className="flex items-center gap-2 text-lg font-semibold">
          <StickyNote className="h-5 w-5" />
          Notizen
        </Label>
        <Button onClick={onSave} size="icon" variant="ghost">
          <Save className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Hier können Sie Ihre Notizen eingeben..."
        className="flex-1 resize-none min-h-0"
      />
    </div>
  );
};