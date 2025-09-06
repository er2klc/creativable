import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { InstagramScanAnimation } from "./InstagramScanAnimation";
import { InstagramScanForm } from "./components/InstagramScanForm";
import { useInstagramScan } from "./hooks/useInstagramScan";
import { ExistingContactAlert } from "../shared/ExistingContactAlert";
import { LeadWithRelations } from "@/types/leads";

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
  const [existingContact, setExistingContact] = useState<LeadWithRelations | null>(null);

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

  const checkExistingContact = async (username: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const normalizedUsername = username.toLowerCase().trim();

      const { data: contact, error } = await supabase
        .from("leads")
        .select(`
          *,
          pipeline:pipeline_id (
            name
          ),
          phase:phase_id (
            name
          )
        `)
        .eq("user_id", user.id)
        .ilike("social_media_username", normalizedUsername)
        .eq("platform", "Instagram")
        .maybeSingle();

      if (error) {
        console.error("Error checking for existing contact:", error);
        return null;
      }

      return contact as unknown as LeadWithRelations | null;
    } catch (error) {
      console.error("Error in checkExistingContact:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!username) {
      toast.error("Bitte gib einen Instagram Benutzernamen ein");
      return;
    }

    try {
      const normalizedUsername = username.toLowerCase().trim();

      const existing = await checkExistingContact(normalizedUsername);
      if (existing) {
        setExistingContact(existing);
        return;
      }

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
        .rpc('create_unique_lead', {
          p_user_id: user.id,
          p_name: normalizedUsername,
          p_platform: "Instagram",
          p_username: normalizedUsername,
          p_pipeline_id: targetPipelineId,
          p_phase_id: targetPhaseId
        });

      if (leadError) {
        if (leadError.code === '23505') {
          const existing = await checkExistingContact(normalizedUsername);
          if (existing) {
            setExistingContact(existing);
            return;
          }
        }
        throw leadError;
      }

      scanState.setIsLoading(true);
      scanState.setScanProgress(0);
      scanState.setCurrentFile(undefined);
      scanState.setIsSuccess(false);
      
      let progress = 5;
      scanState.setScanProgress(progress);
      
      const progressInterval = setInterval(() => {
        const increment = progress > 85 ? 0.5 : 1;
        progress = Math.min(progress + increment, 90);
        scanState.setScanProgress(progress);
      }, 200);

      scanState.pollProgress(lead.id);

      const { error: scanError } = await supabase.functions.invoke('scan-social-profile', {
        body: {
          platform: 'instagram',
          username: username,
          leadId: lead.id
        }
      });

      if (scanError) throw scanError;

      supabase.functions.invoke('process-social-media', {
        body: { leadId: lead.id }
      });

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
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        {existingContact ? (
          <ExistingContactAlert
            contact={existingContact}
            onClose={() => {
              setExistingContact(null);
              onOpenChange(false);
            }}
          />
        ) : scanState.isLoading ? (
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
            contactType=""
            setContactType={() => {}}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
