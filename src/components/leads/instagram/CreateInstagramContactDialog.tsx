import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { useQuery } from "@tanstack/react-query";
import { InstagramScanAnimation } from "./InstagramScanAnimation";

const formSchema = z.object({
  username: z.string().min(1, "Username ist erforderlich"),
});

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
  const [isLoading, setIsLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [mediaProgress, setMediaProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>();
  const [isPhaseOneComplete, setIsPhaseOneComplete] = useState(false);
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
        .maybeSingle();
      
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
        .maybeSingle();
      
      return phase;
    },
    enabled: !!(pipelineId || defaultPipeline?.id)
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  // Progress polling function with improved phase transition handling
  const pollProgress = async (leadId: string) => {
    console.log('Starting progress polling for lead:', leadId);
    let lastProgress = 0;
    let mediaStarted = false;
    let totalMediaFiles = 0;
    let processedMediaFiles = 0;
    let simulationInterval: NodeJS.Timeout | null = null;
    let isPollingActive = true;
    
    const interval = setInterval(async () => {
      if (!isPollingActive) {
        clearInterval(interval);
        if (simulationInterval) clearInterval(simulationInterval);
        return;
      }

      try {
        // Get latest progress and media info
        const { data: posts, error } = await supabase
          .from('social_media_posts')
          .select('processing_progress, bucket_path, media_urls')
          .eq('lead_id', leadId)
          .order('processing_progress', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error polling progress:', error);
          return;
        }

        const currentProgress = posts?.processing_progress ?? lastProgress;
        console.log('Current progress:', currentProgress, 'Phase One Complete:', isPhaseOneComplete);
        
        // Phase 1: Profile Scanning
        if (!isPhaseOneComplete) {
          if (currentProgress >= 27 && currentProgress < 100 && !simulationInterval) {
            // Start simulating progress from 27% to 100%
            let simulatedProgress = currentProgress;
            simulationInterval = setInterval(() => {
              simulatedProgress = Math.min(simulatedProgress + 2, 100);
              setScanProgress(simulatedProgress);
              
              if (simulatedProgress >= 100) {
                clearInterval(simulationInterval!);
                simulationInterval = null;
                setIsPhaseOneComplete(true);
                console.log('Phase 1 completed, transitioning to Phase 2');
              }
            }, 100);
          } else if (currentProgress < 27) {
            setScanProgress(currentProgress);
          }
          lastProgress = currentProgress;
        }
        
        // Phase 2: Media Saving
        if (isPhaseOneComplete) {
          if (!mediaStarted && posts?.media_urls) {
            mediaStarted = true;
            totalMediaFiles = posts.media_urls.length;
            setMediaProgress(0);
            console.log(`Starting media phase, total files: ${totalMediaFiles}`);
          }
          
          // Update media progress based on saved files
          if (posts?.bucket_path) {
            processedMediaFiles++;
            setCurrentFile(posts.bucket_path);
            const mediaProgressPercent = Math.min(
              Math.round((processedMediaFiles / (totalMediaFiles || 1)) * 100),
              100
            );
            setMediaProgress(mediaProgressPercent);
            console.log(`Media progress: ${mediaProgressPercent}%, File: ${posts.bucket_path}`);

            // If no media files or all files processed, complete Phase 2
            if (mediaProgressPercent >= 100 || totalMediaFiles === 0) {
              console.log('Media processing completed');
              isPollingActive = false;
              clearInterval(interval);
              if (simulationInterval) {
                clearInterval(simulationInterval);
              }
            }
          } else if (totalMediaFiles === 0) {
            // If no media files, complete Phase 2 immediately
            setMediaProgress(100);
            isPollingActive = false;
            clearInterval(interval);
            if (simulationInterval) {
              clearInterval(simulationInterval);
            }
          }
        }
      } catch (err) {
        console.error('Error in progress polling:', err);
      }
    }, 1000);

    return () => {
      console.log('Cleaning up progress polling');
      isPollingActive = false;
      clearInterval(interval);
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setScanProgress(0);
      setMediaProgress(0);
      setCurrentFile(undefined);
      setIsPhaseOneComplete(false);
      
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
          name: values.username,
          platform: "Instagram",
          social_media_username: values.username,
          pipeline_id: targetPipelineId,
          phase_id: targetPhaseId,
          industry: "Not Specified"
        })
        .select()
        .single();

      if (leadError) throw leadError;

      // Start polling for progress
      pollProgress(lead.id);

      // Then trigger the scan profile function
      const { error } = await supabase.functions.invoke('scan-social-profile', {
        body: {
          platform: 'instagram',
          username: values.username,
          leadId: lead.id
        }
      });

      if (error) throw error;

      toast.success("Instagram-Kontakt erfolgreich hinzugefügt");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error adding Instagram contact:", error);
      toast.error("Fehler beim Hinzufügen des Instagram-Kontakts");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Instagram-Kontakt hinzufügen</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <InstagramScanAnimation 
            scanProgress={scanProgress} 
            mediaProgress={mediaProgress}
            currentFile={currentFile}
          />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Instagram-Username eingeben" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}