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
        toast.error("Please sign in to generate an iCal URL");
        return;
      }

      const url = `${window.location.origin}/functions/v1/generate-ical`;
      setICalUrl(url);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error generating iCal URL:", error);
      toast.error("Failed to generate iCal URL");
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
        Sync with Phone
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync Calendar with Your Device</DialogTitle>
            <DialogDescription>
              Use this URL to sync your calendar with your device. The calendar will automatically update when you add or modify appointments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg break-all">
              <code className="text-sm">{iCalUrl}</code>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Instructions:</h3>
              <div className="space-y-1 text-sm">
                <p><strong>iPhone:</strong> Go to Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar → paste the URL</p>
                <p><strong>Android:</strong> Open Google Calendar → Settings → Add calendar → From URL → paste the URL</p>
                <p><strong>Outlook:</strong> Settings → Calendar → Shared calendars → Subscribe from web → paste the URL</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};