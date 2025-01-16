import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface ICalButtonProps {
  teamId?: string;
  teamName?: string;
}

export const useICalURL = ({ teamId, teamName }: ICalButtonProps) => {
  const session = useSession();
  const [calendarUrl, setCalendarUrl] = useState<string | null>(null);

  const generateICalURL = async () => {
    try {
      if (!session) {
        toast.error("Bitte melden Sie sich an, um auf Ihren Kalender zuzugreifen");
        return;
      }

      console.log(
        "[iCal] Generating calendar URL for",
        teamId ? `team ${teamId}` : "personal calendar"
      );

      const { data, error } = await supabase.functions.invoke("generate-ical", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          teamId: teamId,
          teamName: teamName,
        },
      });

      if (error) {
        console.error("[iCal] Error generating iCal URL:", error);
        toast.error("Fehler beim Generieren der Kalender-URL");
        return;
      }

      if (data?.url) {
        console.log("[iCal] Calendar URL generated:", data.url);
        setCalendarUrl(data.url);
      }
    } catch (error) {
      console.error("[iCal] Error in generateICalURL:", error);
      toast.error("Fehler beim Generieren der Kalender-URL");
    }
  };

  const copyICalURLToClipboard = async () => {
    if (calendarUrl) {
      try {
        await navigator.clipboard.writeText(calendarUrl);
        toast.success("Kalender-URL in die Zwischenablage kopiert!");
      } catch (err) {
        toast.error("Fehler beim Kopieren der URL");
      }
    }
  };

  return {
    calendarUrl,
    generateICalURL,
    copyICalURLToClipboard,
  };
};
