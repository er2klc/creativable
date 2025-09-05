import React from "react";
import { Button } from "@/components/ui/button";
import { useInstagramConnection } from "@/hooks/use-instagram-connection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function InstagramDisconnectDialog() {
  const { disconnectInstagram } = useInstagramConnection();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Trennen</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Instagram-Verbindung trennen?</AlertDialogTitle>
          <AlertDialogDescription>
            Sind Sie sicher, dass Sie die Verbindung zu Instagram trennen möchten? 
            Sie können sich jederzeit wieder verbinden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={disconnectInstagram}>
            Trennen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}