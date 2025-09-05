
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";

interface PhaseHeaderProps {
  name: string;
  isEditMode: boolean;
  editingName: string;
  isFirst: boolean;
  isLast: boolean;
  onUpdatePhaseName: (newName: string) => void;
  onDeletePhase: () => void;
  onMovePhase?: (direction: 'left' | 'right') => void;
}

export const PhaseHeader = ({
  name,
  isEditMode,
  editingName,
  isFirst,
  isLast,
  onUpdatePhaseName,
  onDeletePhase,
  onMovePhase,
}: PhaseHeaderProps) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdatePhaseName(e.target.value);
  };

  return (
    <div className="flex items-center justify-between gap-2">
      {isEditMode ? (
        <>
          <div className="flex items-center gap-2 flex-1">
            {!isFirst && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMovePhase?.('left')}
                className="h-8 w-8 hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Input
              value={editingName}
              onChange={handleNameChange}
              className="h-8"
            />
            {!isLast && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMovePhase?.('right')}
                className="h-8 w-8 hover:bg-primary/10"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDeletePhase}
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <h3 className="font-medium text-sm tracking-tight">{name}</h3>
      )}
    </div>
  );
};
