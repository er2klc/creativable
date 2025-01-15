import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

export const ICalButton = () => {
  const session = useSession();

  const handleGetICalURL = async () => {
    try {
      if (!session) {
        toast.error("Please sign in to access your calendar");
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-ical', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error generating iCal URL:", error);
        toast.error("Failed to generate calendar URL");
        return;
      }

      if (data?.url) {
        // Copy URL to clipboard
        await navigator.clipboard.writeText(data.url);
        toast.success("Calendar URL copied to clipboard!");
      }
    } catch (error) {
      console.error("Error in handleGetICalURL:", error);
      toast.error("Failed to generate calendar URL");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGetICalURL}
      className="gap-2"
    >
      <Calendar className="h-4 w-4" />
      iCal URL
    </Button>
  );
};