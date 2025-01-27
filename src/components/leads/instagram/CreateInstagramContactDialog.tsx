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
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  const [currentPhase, setCurrentPhase] = useState<1 | 2>(1);
  const [duplicateError, setDuplicateError] = useState<{
    phaseName: string;
    createdAt: string;
    status: string;
  } | null>(null);
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

  // Progress polling function with improved phase management
  const pollProgress = async (leadId: string) => {
    console.log('Starting progress polling for lead:', leadId);
    let lastProgress = 0;
    let mediaStarted = false;
    let totalMediaFiles = 0;
    let processedMediaFiles = 0;
    let simulationInterval: NodeJS.Timeout | null = null;
    let isPollingActive = true;
    let isPhaseOneComplete = false;
    
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
        console.log('Current progress:', currentProgress, 'Current Phase:', currentPhase, 'Phase One Complete:', isPhaseOneComplete);
        
        // Phase 1: Profile Scanning
        if (currentPhase === 1 && !isPhaseOneComplete) {
          if (currentProgress >= 27 && currentProgress < 100 && !simulationInterval) {
            // Start simulating progress from 27% to 100%
            let simulatedProgress = currentProgress;
            simulationInterval = setInterval(() => {
              simulatedProgress = Math.min(simulatedProgress + 2, 100);
              setScanProgress(simulatedProgress);
              
              if (simulatedProgress >= 100) {
                clearInterval(simulationInterval!);
                simulationInterval = null;
                isPhaseOneComplete = true;
                setCurrentPhase(2); // Switch to Phase 2
                console.log('Phase 1 completed, transitioning to Phase 2');
              }
            }, 100);
          } else if (currentProgress < 27) {
            setScanProgress(currentProgress);
          }
          lastProgress = currentProgress;
        }
        
        // Phase 2: Media Saving
        if (currentPhase === 2 || isPhaseOneComplete) {
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
      setDuplicateError(null);
      
      // Check for duplicate contact
      const { data: existingLead, error: checkError } = await supabase
        .from("leads")
        .select(`
          id,
          created_at,
          status,
          phase_id,
          pipeline_phases (
            name
          )
        `)
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .eq("platform", "Instagram")
        .eq("social_media_username", values.username)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking for duplicate:", checkError);
        toast.error("Fehler beim Überprüfen des Benutzers");
        return;
      }

      if (existingLead) {
        setDuplicateError({
          phaseName: existingLead.pipeline_phases?.name || "Unbekannt",
          createdAt: format(new Date(existingLead.created_at), "dd.MM.yyyy"),
          status: existingLead.status || "active"
        });
        return;
      }

      setIsLoading(true);
      setScanProgress(0);
      setMediaProgress(0);
      setCurrentFile(undefined);
      setCurrentPhase(1);
      
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

      // Create the lead with basic info
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

      // Trigger the scan profile function
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
            currentPhase={currentPhase}
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
              
              {duplicateError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="mt-2">
                    <p>Der Benutzername "{form.getValues().username}" auf der Plattform "Instagram" wurde bereits hinzugefügt.</p>
                    <ul className="mt-2 list-disc list-inside">
                      <li>Phase: {duplicateError.phaseName}</li>
                      <li>Hinzugefügt am: {duplicateError.createdAt}</li>
                      <li>Status: {duplicateError.status}</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

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