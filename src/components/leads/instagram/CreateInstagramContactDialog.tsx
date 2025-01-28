import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { InstagramScanAnimation } from "./InstagramScanAnimation";
import { InstagramScanForm } from "./components/InstagramScanForm";
import { useInstagramScan } from "./hooks/useInstagramScan";

interface CreateInstagramContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId: string | null;
  defaultPhase?: string;
}

export function CreateInstagramContactDialog({ 
  open, 
  onOpenChange,
  pipelineId,
  defaultPhase 
}: CreateInstagramContactDialogProps) {
  const [username, setUsername] = useState("");
  const scanState = useInstagramScan();

  // Close dialog when scan reaches 100%
  useEffect(() => {
    if (scanState.scanProgress === 100) {
      setTimeout(() => {
        onOpenChange(false);
        toast.success("Contact successfully created");
      }, 500); // Small delay to show 100%
    }
  }, [scanState.scanProgress, onOpenChange]);

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
        .maybeSingle();
      
      return pipeline;
    },
    enabled: !pipelineId
  });

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
        .maybeSingle();
      
      return phase;
    },
    enabled: !!(pipelineId || defaultPipeline?.id)
  });

  const handleSubmit = async () => {
    if (!username) {
      toast.error("Please enter an Instagram username");
      return;
    }

    try {
      scanState.setIsLoading(true);
      scanState.setScanProgress(0);
      scanState.setCurrentFile(undefined);
      scanState.setIsSuccess(false);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      if (!scanState.settings?.apify_api_key) {
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
          platform: "Instagram",
          social_media_username: username,
          pipeline_id: targetPipelineId,
          phase_id: targetPhaseId,
          industry: "Not Specified"
        })
        .select()
        .single();

      if (leadError) throw leadError;

      scanState.pollProgress(lead.id);

      const { error } = await supabase.functions.invoke('scan-social-profile', {
        body: {
          platform: 'instagram',
          username: username,
          leadId: lead.id
        }
      });

      if (error) throw error;

    } catch (error) {
      console.error("Error adding Instagram contact:", error);
      toast.error("Error adding Instagram contact");
      scanState.setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]"
        aria-describedby="instagram-scan-description"
      >
        <DialogHeader>
          <DialogTitle>Add Instagram Contact</DialogTitle>
        </DialogHeader>
        <div id="instagram-scan-description" className="sr-only">
          Dialog for adding a new Instagram contact. Enter the username to scan their profile.
        </div>
        {scanState.isLoading ? (
          <InstagramScanAnimation 
            scanProgress={scanState.scanProgress} 
            currentFile={scanState.currentFile}
          />
        ) : (
          <InstagramScanForm
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