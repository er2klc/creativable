import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { StatusButtons } from "./StatusButtons";

interface HeaderActionsProps {
  status: string;
  onStatusChange: (newStatus: string) => void;
  onDelete: () => void;
}

export function HeaderActions({ status, onStatusChange, onDelete }: HeaderActionsProps) {
  return (
    <div className="flex gap-2">
      <StatusButtons 
        status={status || 'lead'} 
        onStatusChange={onStatusChange}
      />
      <Button
        variant="outline"
        size="sm"
        className="text-red-600 hover:bg-red-50"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Löschen
      </Button>
    </div>
  );
}