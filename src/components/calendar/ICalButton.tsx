import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ICalButtonProps {
  teamId?: string;
}

export const ICalButton = ({ teamId }: ICalButtonProps) => {
  const session = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState<string | null>(null);

  const handleGetICalURL = async () => {
    try {
      if (!session) {
        toast.error("Bitte melden Sie sich an, um auf Ihren Kalender zuzugreifen");
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-ical', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          teamId: teamId
        }
      });

      if (error) {
        console.error("Error generating iCal URL:", error);
        toast.error("Fehler beim Generieren der Kalender-URL");
        return;
      }

      if (data?.url) {
        // Append .ics to the URL
        const urlWithExtension = `${data.url}.ics`;
        setCalendarUrl(urlWithExtension);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Error in handleGetICalURL:", error);
      toast.error("Fehler beim Generieren der Kalender-URL");
    }
  };

  const handleCopyUrl = async () => {
    if (calendarUrl) {
      try {
        await navigator.clipboard.writeText(calendarUrl);
        toast.success("Kalender-URL in die Zwischenablage kopiert!");
      } catch (err) {
        toast.error("Fehler beim Kopieren der URL");
      }
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleGetICalURL}
        className="gap-2"
      >
        <Calendar className="h-4 w-4" />
        iCal URL
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kalender-URL</DialogTitle>
            <DialogDescription className="space-y-4">
              <p>
                Mit dieser URL können Sie Ihren Kalender in Ihre bevorzugte Kalender-App importieren.
                Die URL wird automatisch aktualisiert, wenn sich Termine ändern.
              </p>
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <code className="flex-1 text-sm break-all">{calendarUrl}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Fügen Sie diese URL als "Abonnierten Kalender" oder "iCal-Feed" in Ihrer Kalender-App hinzu.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};