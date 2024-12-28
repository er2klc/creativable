import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/components/ui/use-toast";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export function DeleteAccountButton() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const supabaseClient = useSupabaseClient();

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);

      // Get current user
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No user found");

      // Delete all user data from all tables
      const tables = [
        'documents',
        'keywords',
        'lead_phases',
        'leads',
        'message_templates',
        'messages',
        'notes',
        'platform_auth_status',
        'settings',
        'tasks'
      ];

      for (const table of tables) {
        const { error } = await supabaseClient
          .from(table)
          .delete()
          .eq('user_id', user.id);
        
        if (error) {
          console.error(`Error deleting from ${table}:`, error);
        }
      }

      // Delete the user from Supabase Auth
      const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(
        user.id
      );

      if (deleteError) {
        throw deleteError;
      }

      // Sign out the user
      await supabaseClient.auth.signOut();
      
      toast({
        title: "Account gelöscht",
        description: "Ihr Account wurde erfolgreich gelöscht.",
      });

      navigate("/");
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Beim Löschen Ihres Accounts ist ein Fehler aufgetreten.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Account löschen</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
          <AlertDialogDescription>
            Diese Aktion kann nicht rückgängig gemacht werden. Ihr Account und alle damit verbundenen Daten werden permanent gelöscht.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Wird gelöscht..." : "Account löschen"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}