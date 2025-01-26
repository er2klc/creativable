import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface CreateLinkedInContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId: string | null;
  defaultPhase?: string;
}

export function CreateLinkedInContactDialog({
  open,
  onOpenChange,
  pipelineId,
  defaultPhase
}: CreateLinkedInContactDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const { settings } = useSettings();

  // Fetch default pipeline if none provided
  const { data: defaultPipeline } = useQuery({
    queryKey: ["default-pipeline"],
    queryFn: async () => {
      if (pipelineId) return null;
      
      const { data: pipeline } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .order("order_index")
        .limit(1)
        .single();
      
      return pipeline;
    },
    enabled: !pipelineId
  });

  // Fetch first phase of pipeline
  const { data: firstPhase } = useQuery({
    queryKey: ["first-phase", pipelineId || defaultPipeline?.id],
    queryFn: async () => {
      const targetPipelineId = pipelineId || defaultPipeline?.id;
      if (!targetPipelineId) return null;

      const { data: phase } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", targetPipelineId)
        .order("order_index")
        .limit(1)
        .single();
      
      return phase;
    },
    enabled: !!(pipelineId || defaultPipeline?.id)
  });

  const validateLinkedInUsername = (username: string) => {
    // Basic validation for LinkedIn usernames
    const usernamePattern = /^[a-zA-Z0-9\-]+$/;
    return usernamePattern.test(username);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLinkedInUsername(username)) {
      toast.error("Bitte geben Sie einen gültigen LinkedIn-Benutzernamen ein");
      return;
    }

    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      if (!settings?.apify_api_key) {
        toast.error("Bitte fügen Sie zuerst einen Apify API Key in den Einstellungen hinzu");
        return;
      }

      const targetPipelineId = pipelineId || defaultPipeline?.id;
      const targetPhaseId = defaultPhase || firstPhase?.id;

      if (!targetPipelineId || !targetPhaseId) {
        toast.error("Keine Pipeline oder Phase gefunden");
        return;
      }

      // First create the lead with basic info
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .insert({
          user_id: user.id,
          name: username,
          platform: "LinkedIn",
          social_media_username: username,
          pipeline_id: targetPipelineId,
          phase_id: targetPhaseId,
          industry: "Not Specified"
        })
        .select()
        .single();

      if (leadError) throw leadError;

      // Then trigger the scan profile function
      const { data, error } = await supabase.functions.invoke('scan-social-profile', {
        body: {
          platform: 'linkedin',
          profileUrl: `https://www.linkedin.com/in/${username}`,
          leadId: lead.id
        }
      });

      if (error) {
        throw new Error('Failed to scan LinkedIn profile');
      }

      toast.success("LinkedIn-Kontakt erfolgreich hinzugefügt");
      onOpenChange(false);
      setUsername("");
    } catch (error) {
      console.error("Error adding LinkedIn contact:", error);
      toast.error("Fehler beim Hinzufügen des LinkedIn-Kontakts");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>LinkedIn-Kontakt hinzufügen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">LinkedIn Benutzername</Label>
            <Input
              id="username"
              placeholder="max-mustermann"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Lädt..." : "Kontakt hinzufügen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}