
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Send, Pencil } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface MessagePreviewProps {
  message: string;
  isLoading: boolean;
  onSend: () => void;
  onBack: () => void;
  onEdit: (newMessage: string) => void;
}

export const MessagePreview = ({
  message,
  isLoading,
  onSend,
  onBack,
  onEdit,
}: MessagePreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedMessage(message);
  };

  const handleSave = () => {
    onEdit(editedMessage);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMessage(message);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h3 className="text-sm font-medium">Message Preview</h3>
        <div className="w-16"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isEditing ? (
          <Textarea
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            className="min-h-[200px]"
            placeholder="Edit your message..."
          />
        ) : (
          <div className="whitespace-pre-wrap rounded-md border p-4 bg-background">
            {message}
          </div>
        )}
      </div>

      <div className="p-3 border-t flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={handleEdit}>
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button onClick={onSend} disabled={isLoading}>
              <Send className="h-4 w-4 mr-1" /> Send
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
