
import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeleteTeamDialogProps {
  children: React.ReactNode;
  onDelete: () => void;
  teamName: string;
}

export const DeleteTeamDialog = ({ children, onDelete, teamName }: DeleteTeamDialogProps) => {
  const [confirmationName, setConfirmationName] = useState("");
  const [isConfirmButtonEnabled, setIsConfirmButtonEnabled] = useState(false);

  useEffect(() => {
    setIsConfirmButtonEnabled(confirmationName === teamName);
  }, [confirmationName, teamName]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-[525px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">Team unwiderruflich löschen</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-4">
            <div className="space-y-2">
              <p className="font-medium text-red-600">Warnung: Diese Aktion kann nicht rückgängig gemacht werden!</p>
              <p>Folgende Daten werden unwiderruflich gelöscht:</p>
              <ul className="list-disc pl-4 space-y-1 text-sm">
                <li>Alle Team-Mitgliedschaften</li>
                <li>Alle Posts und Kommentare</li>
                <li>Alle Kalendereinträge</li>
                <li>Alle Dateien und Medien</li>
                <li>Alle Team-Statistiken und Aktivitäten</li>
                <li>Alle Team-Berechtigungen und Einstellungen</li>
              </ul>
            </div>
            
            <div className="space-y-2 pt-2">
              <Label htmlFor="confirmName">
                Bitte geben Sie den Team-Namen ein zur Bestätigung:
                <span className="font-semibold ml-1">{teamName}</span>
              </Label>
              <Input
                id="confirmName"
                value={confirmationName}
                onChange={(e) => setConfirmationName(e.target.value)}
                placeholder="Team-Namen eingeben"
                className={!isConfirmButtonEnabled ? "border-red-300" : "border-green-300"}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={!isConfirmButtonEnabled}
            className="w-full sm:w-auto"
          >
            Team löschen
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
