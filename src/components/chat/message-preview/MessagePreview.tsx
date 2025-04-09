
import { Button } from "@/components/ui/button";
import { Edit2, Send } from "lucide-react";

interface MessagePreviewProps {
  message: string;
  onEdit: () => void;
  onSend: () => void;
}

export const MessagePreview = ({ message, onEdit, onSend }: MessagePreviewProps) => {
  return (
    <div className="p-4 space-y-3 bg-muted/50 rounded-lg mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Nachrichtenvorschau:</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <Button size="sm" onClick={onSend}>
            <Send className="h-4 w-4 mr-2" />
            Senden
          </Button>
        </div>
      </div>
      <div className="bg-white p-3 rounded-lg whitespace-pre-wrap text-sm">
        {message}
      </div>
    </div>
  );
};
