import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ICalButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [iCalUrl, setICalUrl] = useState<string>("");

  const generateICalUrl = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Bitte melde dich an, um eine iCal URL zu generieren");
        return;
      }

      // Use the full Supabase function URL with auth token
      const url = `https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/generate-ical?token=${session.access_token}`;
      setICalUrl(url);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error generating iCal URL:", error);
      toast.error("Fehler beim Generieren der iCal URL");
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={generateICalUrl}
      >
        <Calendar className="h-4 w-4" />
        Mit Handy synchronisieren
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kalender mit deinem Gerät synchronisieren</DialogTitle>
            <DialogDescription>
              Nutze diese URL, um deinen persönlichen Kalender mit deinem Gerät zu synchronisieren. 
              Der Kalender wird automatisch aktualisiert, wenn du Termine hinzufügst oder änderst.
              
              Bitte beachte: Diese URL enthält nur deine persönlichen Termine. 
              Team-Termine müssen separat über den Team-Kalender synchronisiert werden, 
              um eine bessere Übersicht auf deinem Gerät zu gewährleisten.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg break-all">
              <code className="text-sm">{iCalUrl}</code>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Anleitung:</h3>
              <div className="space-y-1 text-sm">
                <p><strong>iPhone:</strong> Öffne Einstellungen → Kalender → Accounts → Account hinzufügen → Andere → Kalender-Abo hinzufügen → füge die URL ein</p>
                <p><strong>Android:</strong> Öffne Google Kalender → Einstellungen → Kalender hinzufügen → Per URL → füge die URL ein</p>
                <p><strong>Outlook:</strong> Einstellungen → Kalender → Freigegebene Kalender → Aus dem Web abonnieren → füge die URL ein</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};