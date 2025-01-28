import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useLinkedInScan } from "./hooks/useLinkedInScan";
import { LinkedInScanAnimation } from "./components/LinkedInScanAnimation";
import { LinkedInScanForm } from "./components/LinkedInScanForm";

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
  const [username, setUsername] = useState("");
  const scanState = useLinkedInScan();
  const { settings } = useSettings();

  // Close dialog when scan reaches 100%
  useEffect(() => {
    if (scanState.scanProgress === 100) {
      setTimeout(() => {
        onOpenChange(false);
        toast.success("Contact successfully created");
      }, 500); // Small delay to show 100%
    }
  }, [scanState.scanProgress, onOpenChange]);

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

  const handleSubmit = async () => {
    if (!username) {
      toast.error("Please enter a LinkedIn username");
      return;
    }

    try {
      scanState.setIsLoading(true);
      scanState.setScanProgress(0);
      scanState.setCurrentFile(undefined);
      scanState.setIsSuccess(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      if (!settings?.apify_api_key) {
        toast.error("Please add an Apify API key in settings first");
        return;
      }

      const targetPipelineId = pipelineId || defaultPipeline?.id;
      const targetPhaseId = defaultPhase || firstPhase?.id;

      if (!targetPipelineId || !targetPhaseId) {
        toast.error("No pipeline or phase found");
        return;
      }

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

      scanState.pollProgress(lead.id);

      const { error } = await supabase.functions.invoke('scan-linkedin-profile', {
        body: {
          username: username,
          leadId: lead.id
        }
      });

      if (error) throw error;

    } catch (error) {
      console.error("Error adding LinkedIn contact:", error);
      toast.error("Error adding LinkedIn contact");
      scanState.setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]"
        aria-describedby="linkedin-scan-description"
      >
        <DialogHeader>
          <DialogTitle>Add LinkedIn Contact</DialogTitle>
        </DialogHeader>
        <div id="linkedin-scan-description" className="sr-only">
          Dialog for adding a new LinkedIn contact. Enter the username to scan their profile.
        </div>
        {scanState.isLoading ? (
          <LinkedInScanAnimation 
            scanProgress={scanState.scanProgress} 
            currentFile={scanState.currentFile}
          />
        ) : (
          <LinkedInScanForm
            username={username}
            setUsername={setUsername}
            isLoading={scanState.isLoading}
            isSuccess={scanState.isSuccess}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}