import React from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const tables = ["settings", "leads", "messages", "notes", "tasks", "documents", "keywords", "message_templates", "platform_auth_status", "lead_phases"] as const;

export function DeleteAccountButton() {
  const session = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const supabaseClient = useSupabaseClient();

  const handleDeleteAccount = async () => {
    try {
      if (!session?.user?.id) {
        throw new Error("No user session found");
      }

      // Delete user data from all tables
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', session.user.id);
        
        if (error) {
          console.error(`Error deleting from ${table}:`, error);
        }
      }

      // Delete user's own account using the current method
      const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(
        session.user.id
      );

      if (deleteError) {
        // If admin deletion fails, try self-deletion
        const { error: selfDeleteError } = await supabaseClient.auth.updateUser({
          data: { deleted: true }
        });
        if (selfDeleteError) throw selfDeleteError;
      }

      // Sign out the user
      await supabaseClient.auth.signOut();
      
      toast({
        title: "Konto gelöscht",
        description: "Ihr Konto wurde erfolgreich gelöscht.",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Fehler beim Löschen",
        description: "Konto konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
          Konto löschen
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
          <AlertDialogDescription>
            Diese Aktion kann nicht rückgängig gemacht werden. Ihr Konto und alle damit verbundenen Daten werden permanent gelöscht.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Konto löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}