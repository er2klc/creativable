import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TimelineItemActionsProps {
  filePath?: string;
  fileName?: string;
  onDelete?: () => void;
}

export const TimelineItemActions = ({ filePath, fileName, onDelete }: TimelineItemActionsProps) => {
  const handleDownload = async () => {
    if (!filePath) return;

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Fehler beim Herunterladen der Datei');
    }
  };

  return (
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {filePath && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="mr-2"
        >
          Download
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
        >
          Löschen
        </Button>
      )}
    </div>
  );
};