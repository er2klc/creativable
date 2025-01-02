import { Edit, Copy, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlatformCardActionsProps {
  platformId: string;
  onDelete: () => void;
}

export const PlatformCardActions = ({ platformId, onDelete }: PlatformCardActionsProps) => {
  return (
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 bg-black/20 hover:bg-black/40 text-white"
        onClick={() => console.log('Edit clicked')}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 bg-black/20 hover:bg-black/40 text-white"
        onClick={() => console.log('Copy clicked')}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 bg-black/20 hover:bg-black/40 text-white"
        onClick={onDelete}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};