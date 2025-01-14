import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

interface VisionBoardHeaderProps {
  onDownload: () => Promise<void>;
  onPrint: () => void;
}

export const VisionBoardHeader = ({ onDownload, onPrint }: VisionBoardHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Mein Vision Board</h2>
      <div className="flex gap-2">
        <Button
          onClick={onDownload}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Als Bild speichern
        </Button>
        <Button
          onClick={onPrint}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Drucken
        </Button>
      </div>
    </div>
  );
};