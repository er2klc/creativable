export const ICalButton = ({ teamId, teamName }: ICalButtonProps) => {
  const session = useSession();
  const [calendarUrl, setCalendarUrl] = useState<string | null>(null);

  const handleGetICalURL = async () => {
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
      console.error("[iCal] Error in handleGetICalURL:", error);
      toast.error("Fehler beim Generieren der Kalender-URL");
    }
  };

  // Keine UI mehr rendern
  return null;
};
