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
  const [contactType, setContactType] = useState("");
  const scanState = useInstagramScan();

  // Close dialog when scan reaches 100%
  useEffect(() => {
    if (scanState.scanProgress === 100 && scanState.isSuccess) {
      const timer = setTimeout(() => {
        onOpenChange(false);
        toast.success("Contact successfully created");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [scanState.scanProgress, scanState.isSuccess, onOpenChange]);

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
      toast.error("Bitte gib einen Instagram Benutzernamen ein");
      return;
    }

    if (!contactType) {
      toast.error("Bitte wähle einen Kontakttyp aus");
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
        toast.error("Bitte füge einen Apify API Key in den Einstellungen hinzu");
        return;
      }

      const targetPipelineId = pipelineId || defaultPipeline?.id;
      const targetPhaseId = defaultPhase || firstPhase?.id;

      if (!targetPipelineId || !targetPhaseId) {
        toast.error("Keine Pipeline oder Phase gefunden");
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
          contact_type: contactType,
          industry: "Not Specified"
        })
        .select()
        .single();

      if (leadError) throw leadError;

      // Start progress simulation with slower progression at higher percentages
      let progress = 5;
      scanState.setScanProgress(progress);
      
      const progressInterval = setInterval(() => {
        // Slower progression after 85%
        const increment = progress > 85 ? 0.5 : 1;
        progress = Math.min(progress + increment, 90);
        scanState.setScanProgress(progress);
      }, 200);

      // Start the actual scan process in the background
      scanState.pollProgress(lead.id);

      // Call scan-social-profile
      const { error: scanError } = await supabase.functions.invoke('scan-social-profile', {
        body: {
          platform: 'instagram',
          username: username,
          leadId: lead.id
        }
      });

      if (scanError) throw scanError;

      // Call process-social-media and don't wait for completion
      supabase.functions.invoke('process-social-media', {
        body: { leadId: lead.id }
      });

      // Clear simulation and set final progress
      clearInterval(progressInterval);
      scanState.setScanProgress(100);
      scanState.setIsSuccess(true);

    } catch (error) {
      console.error("Error adding Instagram contact:", error);
      toast.error("Fehler beim Hinzufügen des Instagram Kontakts");
      scanState.setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
            contactType={contactType}
            setContactType={setContactType}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}