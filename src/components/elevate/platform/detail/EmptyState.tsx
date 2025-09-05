import { Button } from "@/components/ui/button";
import { CreateUnitDialog } from "./CreateUnitDialog";
import { useState } from "react";

interface EmptyStateProps {
  isAdmin: boolean;
  onCreateUnit: (data: {
    title: string;
    description: string;
    videoUrl: string;
    files: File[];
  }) => Promise<void>;
}

export const EmptyState = ({ isAdmin, onCreateUnit }: EmptyStateProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg text-center space-y-4">
      <h3 className="text-xl font-semibold mb-2">Keine Lerneinheiten verfügbar</h3>
      <p className="text-muted-foreground">
        Für dieses Modul wurden noch keine Lerneinheiten erstellt.
      </p>
      {isAdmin && (
        <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
          Erste Lerneinheit erstellen
        </Button>
      )}
      <CreateUnitDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={onCreateUnit}
      />
    </div>
  );
};