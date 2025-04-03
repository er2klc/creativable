
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, AlertCircle, CheckCircle, Trash2, MailX } from 'lucide-react';
import { formatDate } from '@/lib/utils';
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

export function EmailDiagnosticsPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  // Fetch API email settings
  const { data: apiSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["api-email-settings"],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('api_email_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch sync status for INBOX folder
  const { data: syncStatus, isLoading: isLoadingSyncStatus } = useQuery({
    queryKey: ["email-sync-status", user?.id, "INBOX"],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('email_sync_status')
        .select('*')
        .eq('user_id', user.id)
        .eq('folder', 'INBOX')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user
  });

  // Get email count
  const { data: emailCount, isLoading: isLoadingEmailCount } = useQuery({
    queryKey: ["email-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { count, error } = await supabase
        .from('emails')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user
  });

  // Reset emails mutation
  const resetEmails = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      // First delete all emails
      const { error: deleteError } = await supabase
        .from('emails')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) throw deleteError;
      
      // Then delete sync status
      const { error: syncError } = await supabase
        .from('email_sync_status')
        .delete()
        .eq('user_id', user.id);
      
      if (syncError) throw syncError;
      
      return true;
    },
    onSuccess: () => {
      toast.success("E-Mail-Daten zurückgesetzt", {
        description: "Alle E-Mails und Synchronisierungsdaten wurden gelöscht."
      });
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["email-count"] });
      queryClient.invalidateQueries({ queryKey: ["email-sync-status"] });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      
      setIsResetDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Fehler beim Zurücksetzen", {
        description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"
      });
    }
  });
  
  const isLoading = isLoadingSettings || isLoadingSyncStatus || isLoadingEmailCount;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Diagnose & Wartung</h2>
        <p className="text-muted-foreground">
          Hier können Sie den Status Ihrer E-Mail-Synchronisierung überprüfen und Probleme beheben.
        </p>
      </div>
      
      <div className="grid gap-6">
        {/* Connection Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {apiSettings ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Verbindungsstatus
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Verbindungsstatus
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {apiSettings ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Server:</div>
                  <div>{apiSettings.host}</div>
                  
                  <div className="font-medium">Benutzername:</div>
                  <div>{apiSettings.username}</div>
                  
                  <div className="font-medium">Ordner:</div>
                  <div>{apiSettings.folder || 'INBOX'}</div>
                  
                  <div className="font-medium">TLS aktiviert:</div>
                  <div>{apiSettings.tls ? 'Ja' : 'Nein'}</div>
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-yellow-500 mb-2">Keine E-Mail-Verbindung konfiguriert</p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const tabsElement = document.querySelector('[role="tablist"]');
                    // Find and click the config tab
                    if (tabsElement) {
                      const configTab = Array.from(tabsElement.children).find(
                        child => child.textContent?.includes('Konfiguration')
                      );
                      if (configTab && configTab instanceof HTMLElement) {
                        configTab.click();
                      }
                    }
                  }}
                >
                  Konfigurieren
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Sync Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Synchronisierungsstatus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Letzte Synchronisierung:</div>
                <div>
                  {syncStatus?.last_sync_date 
                    ? formatDate(syncStatus.last_sync_date) 
                    : 'Keine Synchronisierung durchgeführt'}
                </div>
                
                <div className="font-medium">Synchronisierungsstatus:</div>
                <div className="flex items-center">
                  {syncStatus?.sync_in_progress ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2 text-blue-500" />
                      <span className="text-blue-500">Synchronisierung läuft...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Bereit</span>
                    </>
                  )}
                </div>
                
                {syncStatus?.last_error && (
                  <>
                    <div className="font-medium">Letzter Fehler:</div>
                    <div className="text-red-500">{syncStatus.last_error}</div>
                  </>
                )}
                
                <div className="font-medium">E-Mails in der Datenbank:</div>
                <div>{emailCount || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Reset Data Card */}
        <Card className="border-red-100">
          <CardHeader className="text-red-500">
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Daten zurücksetzen
            </CardTitle>
            <CardDescription className="text-red-400">
              Warnung: Diese Aktion löscht alle E-Mails aus der Datenbank.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Wenn Probleme mit der E-Mail-Synchronisierung auftreten, kann es helfen, 
              alle Daten zurückzusetzen und eine neue Synchronisierung zu starten.
            </p>
          </CardContent>
          <CardFooter>
            <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <MailX className="h-4 w-4" />
                  E-Mail-Daten zurücksetzen
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>E-Mail-Daten löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Diese Aktion löscht alle E-Mails und Synchronisierungsdaten aus der Datenbank.
                    Die E-Mails auf dem Server bleiben erhalten und können neu synchronisiert werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => resetEmails.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {resetEmails.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Löschen...
                      </>
                    ) : (
                      "Ja, alles löschen"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
